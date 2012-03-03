StoryQuickAddView = Backbone.View.extend({

    tagName:'div',
    attributes: {
        class: "add-story-quick"
    },

    events: {
        'click .btn': 'add_story'
    },

    add_story: function (event) {
        var new_story = app.stories.create({
            title: $(this.el).find('.add-story-quick-input').val()
        });
        if($('.story-quick-add-details:checked').length > 0) {
            app.showView('#sidebar', new StoryView({model:new_story}));
        }
        var flyer = new StoryFlyView({model: new_story});
        var start_pos = $(this.el).find('.btn').position();
        flyer.fly_in($('div.stories'), start_pos.top, start_pos.left + 100, $('div.stories').height(), 0);
        return false;
    },

    initialize:function () {
        this.template = _.template(tpl.get('story-quick-add'));
    },

    render:function (eventName) {
        $(this.el).html(this.template());
        return this;
    }
});

StoryFlyView = Backbone.View.extend({
    tagName:'div',
    attributes: {
        class: 'story-flying'
    },

    fly_in:function (node, start_top, start_left, target_top, target_left) {
        var story = $(this.render().el).css({
            opacity: 0.9,
            top: start_top,
            left: start_left,
            'z-index': 10
        });
        node.append(story);
        story.animate({
            opacity: 0,
            top: target_top+'',
            left: target_left+'',
            }, 600, function() {
            $(this).remove();
        });

    },
    render:function (event) {
        $(this.el).html(new StoryRowView({model:this.model}).render().el);

        return this;
    }

});