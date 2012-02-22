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
    }
});

StoryCollection = Backbone.Collection.extend({
    model: Story,
});