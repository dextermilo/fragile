StoryQuickAddView = Backbone.View.extend({

    tagName:'div',
    attributes: {
        class: "add-story-quick"
    },

    events: {
        'click .btn': 'add_story'
    },

    add_story: function (event) {
        var new_story = app.currentPrj.stories.create({
            project: app.currentPrj.id,
            title: $(this.el).find('.add-story-quick-input').val()
        });
        var flyer = new StoryFlyView();
        var start_pos = $(this.el).find('.btn').position();
        var story_node = $('div.stories .story-'+new_story.cid);
        if($('.story-quick-add-details:checked').length > 0) {
            $('#sidebar').html(new StoryView({model:new_story}).render().el);
            story_node.find('.story').addClass('selected');
        }
        $(this.el).find('.add-story-quick-input').val('');
        
        flyer.render(story_node, -start_pos.top, start_pos.left + 100, story_node.position().top, story_node.position().left);
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

    render:function (story, start_top, start_left, target_top, target_left, callback) {
        story.addClass('story-flying');
        story.css({
            top: start_top,
            left: start_left
        });
        story.animate({
            top: target_top+'',
            left: target_left+'',
            }, 600, function() {
                $(this).removeClass('story-flying');
                if (typeof callback === 'function') callback();
        });

    }

});