Backbone.View.prototype.close = function () {
    console.log('Closing view ' + this);
    if (this.beforeClose) {
        this.beforeClose();
    }
    this.remove();
    this.unbind();
};

var AppRouter = Backbone.Router.extend({

    initialize:function () {
        $('#header').html(new HeaderView().render().el);
    },

    routes:{
        "":"list",
        "/stories/:id":"storyDetails"
    },

    list:function () {
        this.before();
    },

    storyDetails:function (id) {
        this.before(function () {
            var model = app.stories.get(id);
            app.showView('#sidebar', new StoryView({model:model}));
        });
    },

    showView:function (selector, view) {
        if (this.currentView)
            this.currentView.close();
        $(selector).html(view.render().el);
        this.currentView = view;
        return view;
    },

    before:function (callback) {
        if (!this.stories) {
            this.stories = new StoryCollection();
            this.stories.reset(storydata);
            $('#content').html(new StoryTableView({model:app.stories}).render().el);
        }
    }

});

tpl.loadTemplates(['header', 'story-details', 'story-table', 'story-row'], function () {
    app = new AppRouter();
    Backbone.history.start();
});