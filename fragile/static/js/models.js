Project = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
        "_id": null,
        "cid": null,
        "title": "",
        "stories": [],
    },
    url: function() {
        return this.collection.url + '/' + this.get('_id');
    }
});

ProjectCollection = Backbone.Collection.extend({
    model: Project,
    url: ''
});


Story = Backbone.Model.extend({
    idAttribute: '_id',
    defaults:{
        "_id": null,
        "cid": null,
        "title": "",
        "summary": "",
        "details": "",
        "owner": "",
        "state": "",
        "blocked": "",
        "iteration": "",
        "points": "",
    },
    url: function() {
        return this.collection.url() + '/' + this.get('_id');
    }
});

StoryCollection = Backbone.Collection.extend({
    model: Story,
    url: function() {
        return this.context.url();
    }
});
