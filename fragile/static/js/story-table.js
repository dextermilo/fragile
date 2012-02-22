StoryTableView = Backbone.View.extend({

    tagName:'table',

    initialize:function () {
        this.template = _.template(tpl.get('story-table'));
        this.model.bind("reset", this.render, this);
        var self = this;
        this.model.bind("add", function (model) {
            $(self.el).append(new StoryRowView({model:model}).render().el);
        });
    },

    render:function (eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        _.each(this.model.models, function (model) {
            $(this.el).append(new StoryRowView({model:model}).render().el);
        }, this);
        return this;
    }
});

StoryRowView = Backbone.View.extend({

    tagName:"tr",

    events: {
        'click td': 'showDetails'
    },

    showDetails: function() {
        app.showView('#sidebar', new StoryView({model:this.model}));
    },

    initialize:function () {
        this.template = _.template(tpl.get('story-row'));
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },

    render:function (eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }

});