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
        var story = app.stories.create();
        app.showView('#sidebar', new StoryView({model:story}));  
        return false;
    }

});