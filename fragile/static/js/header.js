window.HeaderView = Backbone.View.extend({

    initialize:function () {
        this.template = _.template(tpl.get('header'));
    },

    render:function (eventName) {
        $(this.el).html(this.template());
        return this;
    },

    events:{
        "click .new": "newStory"
    },

    newStory:function (event) {
        app.navigate(app.currentPrj.url() + '/new', {trigger: true});
        return false;
    }

});