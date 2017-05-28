/*
 * @name DoubleScroll
 * @desc displays scroll bar on top and on the bottom of the div
 * @requires jQuery, jQueryUI
 *
 * @author Pawel Suwala - http://suwala.eu/
 * @version 0.3 (12-03-2014)
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */

/*(function($){
    $.widget("suwala.doubleScroll", {
        options: {
            contentElement: undefined, // Widest element, if not specified first child element will be used
            topScrollBarMarkup: '<div class="suwala-doubleScroll-scroll-wrapper" style="height: 20px;"><div class="suwala-doubleScroll-scroll" style="height: 20px;"></div></div>',
            topScrollBarInnerSelector: '.suwala-doubleScroll-scroll',
            scrollCss: {
                'overflow-x': 'scroll',
                'overflow-y':'hidden'
            },
            contentCss: {
                'overflow-x': 'scroll',
                'overflow-y':'hidden'
            }
        },
        _create : function() {
            var self = this;
            var contentElement;

            // add div that will act as an upper scroll
            var topScrollBar = $($(self.options.topScrollBarMarkup));
            self.element.before(topScrollBar);

            // find the content element (should be the widest one)
            if (self.options.contentElement !== undefined && self.element.find(self.options.contentElement).length !== 0) {
                contentElement = self.element.find(self.options.contentElement);
            }
            else {
                contentElement = self.element.find('>:first-child');
            }

            // bind upper scroll to bottom scroll
            topScrollBar.scroll(function(){
                self.element.scrollLeft(topScrollBar.scrollLeft());
            });

            // bind bottom scroll to upper scroll
            self.element.scroll(function(){
                topScrollBar.scrollLeft(self.element.scrollLeft());
            });

            // apply css
            topScrollBar.css(self.options.scrollCss);
            self.element.css(self.options.contentCss);

            // set the width of the wrappers
            $(self.options.topScrollBarInnerSelector, topScrollBar).width(contentElement[0].scrollWidth);
            topScrollBar.width(self.element[0].clientWidth);
        },
        refresh: function(){
            // this should be called if the content of the inner element changed.
            // i.e. After AJAX data load
            var self = this;
            var contentElement;
            var topScrollBar = self.element.parent().find('.suwala-doubleScroll-scroll-wrapper');

            // find the content element (should be the widest one)
            if (self.options.contentElement !== undefined && self.element.find(self.options.contentElement).length !== 0) {
                contentElement = self.element.find(self.options.contentElement);
            }
            else {
                contentElement = self.element.find('>:first-child');
            }

            // set the width of the wrappers
            $(self.options.topScrollBarInnerSelector, topScrollBar).width(contentElement[0].scrollWidth);
            topScrollBar.width(self.element[0].clientWidth);
        }
    });
})(jQuery);/**
 * Created by mattiacorradi on 27/02/2017.
 */



(function( $ ) {

    jQuery.fn.doubleScroll = function(userOptions) {

        // Default options
        var options = {
            contentElement: undefined, // Widest element, if not specified first child element will be used
            scrollCss: {
                'overflow-x': 'auto',
                'overflow-y': 'hidden'
            },
            contentCss: {
                'overflow-x': 'auto',
                'overflow-y': 'hidden'
            },
            onlyIfScroll: true, // top scrollbar is not shown if the bottom one is not present
            resetOnWindowResize: false, // recompute the top ScrollBar requirements when the window is resized
            timeToWaitForResize: 30 // wait for the last update event (usefull when browser fire resize event constantly during ressing)
        };

        $.extend(true, options, userOptions);

        // do not modify
        // internal stuff
        $.extend(options, {
            topScrollBarMarkup: '<div class="suwala-doubleScroll-scroll-wrapper" style="height: 20px;"><div class="suwala-doubleScroll-scroll" style="height: 20px;"></div></div>',
            topScrollBarWrapperSelector: '.suwala-doubleScroll-scroll-wrapper',
            topScrollBarInnerSelector: '.suwala-doubleScroll-scroll'
        });

        var _showScrollBar = function($self, options) {

            if (options.onlyIfScroll && $self.get(0).scrollWidth <= $self.width()) {
                // content doesn't scroll
                // remove any existing occurrence...
                $self.prev(options.topScrollBarWrapperSelector).remove();
                return;
            }

            // add div that will act as an upper scroll only if not already added to the DOM
            var $topScrollBar = $self.prev(options.topScrollBarWrapperSelector);

            if ($topScrollBar.length == 0) {

                // creating the scrollbar
                // added before in the DOM
                $topScrollBar = $(options.topScrollBarMarkup);
                $self.before($topScrollBar);

                // apply the css
                $topScrollBar.css(options.scrollCss);
                $self.css(options.contentCss);

                // bind upper scroll to bottom scroll
                $topScrollBar.bind('scroll.doubleScroll', function() {
                    $self.scrollLeft($topScrollBar.scrollLeft());
                });

                // bind bottom scroll to upper scroll
                var selfScrollHandler = function() {
                    $topScrollBar.scrollLeft($self.scrollLeft());
                };
                $self.bind('scroll.doubleScroll', selfScrollHandler);
            }

            // find the content element (should be the widest one)
            var $contentElement;

            if (options.contentElement !== undefined && $self.find(options.contentElement).length !== 0) {
                $contentElement = $self.find(options.contentElement);
            } else {
                $contentElement = $self.find('>:first-child');
            }

            // set the width of the wrappers
            $(options.topScrollBarInnerSelector, $topScrollBar).width($contentElement.outerWidth());
            $topScrollBar.width("100%");
            $topScrollBar.scrollLeft($self.scrollLeft());

        }

        return this.each(function() {

            var $self = $(this);

            _showScrollBar($self, options);

            // bind the resize handler
            // do it once
            if (options.resetOnWindowResize) {

                var id;
                var handler = function(e) {
                    _showScrollBar($self, options);
                };

                $(window).bind('resize.doubleScroll', function() {
                    // adding/removing/replacing the scrollbar might resize the window
                    // so the resizing flag will avoid the infinite loop here...
                    clearTimeout(id);
                    id = setTimeout(handler, options.timeToWaitForResize);
                });

            }

        });

    }

}( jQuery ));