Backbone.View.prototype.close = function () {
    console.log('Closing view ' + this);
    if (this.beforeClose) {
        this.beforeClose();
    }
    this.remove();
    this.unbind();
};

var AppRouter = Backbone.Router.extend({

    routes:{
        "": "projectDetails",
        ":story": "storyDetails"
    },

    states: {
        "idea": "Discovery",
        "defined": "Estimated",
        "scope": "In Scope",
        "progress": "Implementing",
        "completed": "Reviewing",
        "accepted": "Approved"
    },

    // Temporary list of "users"
    users: [
        "David",
        "Ryan"
    ],
    
    projectDetails: function(callback) {
        if (this.currentPrj != undefined) {
            if (callback != undefined) {
                callback();
                return;
            }
        }

        var prj = this.currentPrj = new Project(initial.project);
        prj.stories = new StoryCollection();
        prj.stories.context = prj;
        var prj_view = new ProjectDetailsView({model:prj});
        this.showView('#content', prj_view);

        prj.stories.reset(initial.stories);
        $(prj_view.el).append(new StoryTableView({model:prj.stories}).render().el);
        if (callback != undefined) {
            callback();
        }

    },

    storyDetails:function (story_id) {
        this.projectDetails(function() {
            if (story_id == 'new') {
                var story = app.currentPrj.stories.create({project: app.currentPrj.id});
            } else {
                var story = app.currentPrj.stories.get(story_id);
            }
            $('#sidebar').html(new StoryView({model:story}).render().el);
        });
    },

    showView:function (selector, view) {
        if (this.currentView)
            this.currentView.close();
        $(selector).html(view.render().el);
        this.currentView = view;
        return view;
    }

});


tpl.loadTemplates(['header', 'project-row', 'project-details', 'story-details', 'story-table',
    'story-row', 'story-state', 'story-quick-add'], function () {
    app = new AppRouter();
    Backbone.history.start();
});