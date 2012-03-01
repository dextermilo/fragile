StoryView = Backbone.View.extend({

    states: {},

    initialize: function () {
        this.template = _.template(tpl.get('story-details'));
        this.model.bind("change", this.render, this);
        this.states = app.states;
    },

    render: function (eventName) {
        $(this.el).html(this.template(_.extend({ states: this.states }, this.model.toJSON())));
        return this;
    },

    events:{
        "change input,select": "change",
        "click .delete": "delete"
    },

    change: function (event) {
        // XXX should we save in response to the change event?
        // but then how do we avoid re-broadcasting the change
        // on slave clients?
        var change = {};
        change[event.target.name] = event.target.value;
        this.model.set(change);
        this.model.save();
    },

    delete: function () {
        var self = this;
        this.model.destroy({
            success:function () {
                self.close();
            }
        });
        return false;
    }

});