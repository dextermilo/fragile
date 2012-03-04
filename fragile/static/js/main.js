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
        "": "projectList",
        ":prj": "projectDetails",
        ":prj/:story": "storyDetails"
    },

    states: {
        "idea": "Discovery",
        "defined": "Estimated",
        "scope": "In Scope",
        "progress": "Implementing",
        "completed": "Reviewing",
        "accepted": "Approved"
    },

    projectList:function () {
        if (!this.projects) {
            this.projects = new ProjectCollection();
            this.projects.reset(projectdata);
            $('#content').html(new ProjectListView({model:app.projects}).render().el);
        }
    },

    projectDetails: function(prj_id, callback) {
        this.projectList();

        if (this.currentPrj != undefined && this.currentPrj.id == prj_id) {
            if (callback != undefined) {
                callback();
                return;
            }
        }

        var prj = this.currentPrj = app.projects.get(prj_id);
        prj.stories = new StoryCollection();
        prj.stories.context = prj;
        var prj_view = new ProjectDetailsView({model:prj});
        this.showView('#content', prj_view);
        prj.stories.fetch({success:function () {
            $(prj_view.el).append(new StoryTableView({model:prj.stories}).render().el);
            if (callback != undefined) {
                callback();
            }
        }});

    },

    storyDetails:function (prj_id, story_id) {
        this.projectDetails(prj_id, function() {
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