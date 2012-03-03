StoryTableView = Backbone.View.extend({

    tagName:'div',

    initialize:function () {
        this.template = _.template(tpl.get('story-table'));
        this.model.bind("reset", this.render, this);
        var self = this;
        this.model.bind("add", function (model) {
            var row = $(new StoryRowView({model:model}).render().el);
            row.hide();
            $(self.el).find('.stories').append(row);
            row.fadeIn(1000);
        });
    },

    render:function (eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        $(this.el).find('.quick-add-placeholder').replaceWith(new StoryQuickAddView().render().el);
        _.each(this.model.models, function (model) {
            $(this.el).find('.stories').append(new StoryRowView({model:model}).render().el);
        }, this);
        return this;
    },

    events: {
        "click .new": "newStory"
    },

    newStory: function() {
        app.navigate(this.model.url() + '/new', {trigger: true});
        return false;
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

    events: {
        'click div': 'showDetails'
    },

    showDetails: function() {
        $('div.story.selected').removeClass('selected');
        $(this.el).find('.story').addClass('selected');
        app.navigate(this.model.url(), {trigger: true});
    },

    initialize:function () {
        this.template = _.template(tpl.get('story-row'));
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },

    render:function (eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        $(this.el).find('.story-state').html(new StateSelectorView({model: this.model}).render().el);
        return this;
    }

});