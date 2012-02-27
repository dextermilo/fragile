ProjectListView = Backbone.View.extend({

    tagName: 'ul',

    initialize:function () {
        this.model.bind("reset", this.render, this);
        var self = this;
        this.model.bind("add", function (model) {
            $(self.el).append(new ProjectRowView({model:model}).render().el);
        });
    },

    render:function (eventName) {
        _.each(this.model.models, function (model) {
            $(this.el).append(new ProjectRowView({model:model}).render().el);
        }, this);
        return this;
    }
});

ProjectRowView = Backbone.View.extend({

    tagName: "li",

    initialize:function () {
        this.template = _.template(tpl.get('project-row'));
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },

    render:function (eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }

});