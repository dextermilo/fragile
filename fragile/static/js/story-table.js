StoryTableView = Backbone.View.extend({

    tagName:'div',

    initialize:function () {
        this.template = _.template(tpl.get('story-table'));
        this.model.bind("reset", this.render, this);
        var self = this;
        this.model.bind("add", function (model) {
            var row = $(new StoryRowView({model:model}).render().el);
            $(self.el).find('.stories').append(row);
        });
    },

    render:function (eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        $(this.el).find('.quick-add-placeholder').replaceWith(new StoryQuickAddView().render().el);
        _.each(this.model.models, function (model) {
            $(this.el).find('.stories').append(new StoryRowView({model:model}).render().el);
        }, this);
        $('.stories', this.el).sortable({
            axis: 'y',
            update: function(event, ui) {
                var attrs = ui.item[0].model.attributes;
                attrs.position = ui.item.index();
                socket.json.emit('reorder', app.currentPrj.id, attrs);
            }
        });
        return this;
    }

});

StateSelectorView = Backbone.View.extend({

    tagName: "div",

    attributes: {
        "class": "sel-states dropdown"
    },

    events: {
        'click .sel-state': 'selectState',
        'click .sel-blocked a': 'selectBlock'
    },

    states: {},

    initialize:function () {
        this.template = _.template(tpl.get('story-state'));
        this.states = app.states;
    },

    selectState: function(event) {
        this.model.set('state', $(event.target).attr('data-state'));
        $(this.el).removeClass('selected');
        this.model.save();
        return false;
    },

    selectBlock: function(event) {
        if(this.model.get('blocked')) {
            this.model.set('blocked', false);
        } else {
            this.model.set('blocked', true);
        }
        this.model.save();
    },

    render: function (eventName) {
        $(this.el).html(this.template(_.extend({ states: this.states }, this.model.toJSON())));
        $(this.el).find('.dropdown-toggle').dropdown();
        return this;
    }
})

StoryRowView = Backbone.View.extend({

    tagName:"div",

    initialize: function() {
        this.template = _.template(tpl.get('story-row'));
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);

        var self = this;
        this.model.bind("reorder", function (pos) {
            var story = $(self.el);
            var flyer = new StoryFlyView();
            var start_pos = story.position();
            var start_ph = $('<div class="ui-sortable-placeholder" />');
            var target_ph = $('<div class="ui-sortable-placeholder" />');
            var old_pos = story.index();
            
            if (pos==0) {
                $(self.el).detach().prependTo($('div.stories'));
                target_ph.prependTo($('div.stories'));
            } else {
                $(self.el).detach().insertAfter($('.story').eq(pos-1).parent());
                target_ph.insertAfter($('.story').eq(pos-1).parent());
            }
            

            flyer.render(story, start_pos.top, start_pos.left, $(self.el).position().top, $(self.el).position().left, function() {
                target_ph.remove();
                start_ph.remove();
            });

            start_ph.insertAfter($('.story').eq(old_pos).parent());
            start_ph.height(story.height());
            start_ph.slideUp(600);
            target_ph.insertAfter($('.story').eq(pos-1).parent());
            target_ph.height(1);
            target_ph.animate({
                height: story.height()+''
            }, 600);
            
            
        });
    },

    events: {
        'click div': 'showDetails',
        'click .story-owner-user': 'select_owner'
    },

    select_owner: function (event) {
        var user;

        user = $(event.target).attr('data-user');

        this.model.set("owner", user);
        this.model.save();
    },

    showDetails: function() {
        $('div.story.selected').removeClass('selected');
        $(this.el).find('.story').addClass('selected');
        app.navigate(this.model.url(), {trigger: true});
    },

    render:function (eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        $(this.el).addClass('story-'+this.model.cid);
        $(this.el).find('.story-state').html(new StateSelectorView({model: this.model}).render().el);
        this.el.model = this.model;
        return this;
    }

});