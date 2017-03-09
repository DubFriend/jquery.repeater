$.fn.repeaterVal = function () {
    var parse = function (raw) {
        var parsed = [];

        foreach(raw, function (val, key) {
            var parsedKey = [];
            if(key !== "undefined") {
                parsedKey.push(key.match(/^[^\[]*/)[0]);
                parsedKey = parsedKey.concat(map(
                    key.match(/\[[^\]]*\]/g),
                    function (bracketed) {
                        return bracketed.replace(/[\[\]]/g, '');
                    }
                ));

                parsed.push({
                    val: val,
                    key: parsedKey
                });
            }
        });

        return parsed;
    };

    var build = function (parsed) {
        if(
            parsed.length === 1 &&
            (parsed[0].key.length === 0 || parsed[0].key.length === 1 && !parsed[0].key[0])
        ) {
            return parsed[0].val;
        }

        foreach(parsed, function (p) {
            p.head = p.key.shift();
        });

        var grouped = (function () {
            var grouped = {};

            foreach(parsed, function (p) {
                if(!grouped[p.head]) {
                    grouped[p.head] = [];
                }
                grouped[p.head].push(p);
            });

            return grouped;
        }());

        var built;

        if(/^[0-9]+$/.test(parsed[0].head)) {
            built = [];
            foreach(grouped, function (group) {
                built.push(build(group));
            });
        }
        else {
            built = {};
            foreach(grouped, function (group, key) {
                built[key] = build(group);
            });
        }

        return built;
    };

    return build(parse($(this).inputVal()));
};

$.fn.repeater = function ( options ) {
    var cmd, cmdFn, fig;
    var args = $.makeArray( arguments );
    
    if( $.type( options ) == 'string' ) {
        return this.each(function() {
            var cmdArgs;
            fig = $(this).data('repeater.fig');

            cmd = options;
            cmdFn = fig.API[ cmd ];
            if ( $.isFunction( cmdFn )) {
                cmdArgs = args;//$.makeArray( args );
                cmdArgs.shift();
                return cmdFn.apply( fig.API, cmdArgs );
            } else {
                $.fn.repeater.log('unknown command ' + cmd);
            }
       });
    } else {
        return this.each(function() {
            var container = $(this);
            
            var data = container.data();
            for (var p in data) {
                // allow props to be accessed sans 'repeater' prefix and log the overrides
                if (data.hasOwnProperty(p) && /^repeater[A-Z]+/.test(p) ) {
                    val = data[p];
                    shortName = p.match(/^repeater(.*)/)[1].replace(/^[A-Z]/, lowerCase);
                    log(shortName+':', val, '('+typeof val +')');
                    data[shortName] = val;
                }
            }
            
            fig = $.extend( {}, $.fn.repeater.defaults, data, options || {});
            fig.container = container;

            fig.itemTemplate = container.find('[data-repeater-item]').first().clone().hide();

            fig.API = $.extend ( { _container: container }, $.fn.repeater.API );
            fig.API.trigger = function( eventName, args ) {
                fig.container.trigger( eventName, args );
                return fig.API;
            };

            container.data( 'repeater.fig', fig );
            container.data( 'repeater.API', fig.API );
            
            fig.API.init();
        });
    };
};

$.fn.repeater.API = {
    fig: function() {
        return this._container.data( 'repeater.fig' );
    },
    setList: function (rows) {
        var fig = this.fig(),
            container = fig.container;

        this.getItems().remove();
        foreach(rows, function(data) {
            fig.API.addItem(data);
        });
    },
    filterNested: function ($items, repeaters) {
        return $items.filter(function () {
            return repeaters ?
                $(this).closest(
                    pluck(repeaters, 'selector').join(',')
                ).length === 0 : true;
        });
    },
    getList: function() {
        var fig = this.fig(),
            container = fig.container;

        return container.find('[data-repeater-list]').first();
    },
    getItems: function () {
        var fig = this.fig(),
            $list = this.getList();

        return this.filterNested($list.find('[data-repeater-item]'), fig.repeaters);
    },
    getGroupName: function() {
        var fig = this.fig(),
            $list = this.getList(),
            groupName = $list.data('repeater-list');

        return fig.$parent ?
            fig.$parent.data('item-name') + '[' + groupName + ']' :
            groupName;
    },
    initNested: function ($listItems) {
        var fig = this.fig();
        
        if(fig.repeaters) {
            $listItems.each(function () {
                var $item = $(this);
                foreach(fig.repeaters, function (nestedFig) {
                    $item.find(nestedFig.selector).repeater(extend(
                        nestedFig, { $parent: $item }
                    ));
                });
            });
        }
    },
    foreachRepeaterInItem: function (repeaters, $item, cb) {
        if(repeaters) {
            foreach(repeaters, function (nestedFig) {
                cb.call($item.find(nestedFig.selector)[0], nestedFig);
            });
        }
    },
    setIndexes: function ($items, groupName, repeaters) {
        var fig = this.fig();

        $items.each(function (index) {
            var $item = $(this);
            $item.data('item-name', groupName + '[' + index + ']');
            fig.API.filterNested($item.find('[name]'), repeaters)
            .each(function () {
                var $input = $(this);
                // match non empty brackets (ex: "[foo]")
                var matches = $input.attr('name').match(/\[[^\]]+\]/g);

                var name = matches ?
                    // strip "[" and "]" characters
                    last(matches).replace(/\[|\]/g, '') :
                    $input.attr('name');

                var newName = groupName + '[' + index + '][' + name + ']' +
                    ($input.is(':checkbox') || $input.attr('multiple') ? '[]' : '');

                $input.attr('name', newName);

                fig.API.foreachRepeaterInItem(repeaters, $item, function (nestedFig) {
                    var $repeater = $(this);
                    fig.API.setIndexes(
                        fig.API.filterNested($repeater.find('[data-repeater-item]'), nestedFig.repeaters || []),
                        groupName + '[' + index + ']' +
                                    '[' + $repeater.find('[data-repeater-list]').first().data('repeater-list') + ']',
                        nestedFig.repeaters
                    );
                });
            });
        });
        
        var $list = this.getList();
        $list.find('input[name][checked]')
            .removeAttr('checked')
            .prop('checked', true);
    },
    
    appendItem: function ($item, data) {
        var fig = this.fig();
        
        var setItemsValues = function ($item, data, repeaters) {
            if(data || fig.defaultValues) {
                var inputNames = {};
                fig.API.filterNested($item.find('[name]'), repeaters).each(function () {
                    var key = $(this).attr('name').match(/\[([^\]]*)(\]|\]\[\])$/)[1];
                    inputNames[key] = $(this).attr('name');
                });

                $item.inputVal(map(
                    filter(data || fig.defaultValues, function (val, name) {
                        return inputNames[name];
                    }),
                    identity,
                    function (name) {
                        return inputNames[name];
                    }
                ));
            }

            fig.API.foreachRepeaterInItem(repeaters, $item, function (nestedFig) {
                var $repeater = $(this);
                fig.API.filterNested(
                    $repeater.find('[data-repeater-item]'),
                    nestedFig.repeaters
                )
                .each(function () {
                    var fieldName = $repeater.find('[data-repeater-list]').data('repeater-list');
                    if(data && data[fieldName]) {
                        var $template = $(this).clone();
                        $repeater.find('[data-repeater-item]').remove();
                        foreach(data[fieldName], function (data) {
                            var $item = $template.clone();
                            setItemsValues(
                                $item,
                                data,
                                nestedFig.repeaters || []
                            );
                            $repeater.find('[data-repeater-list]').append($item);
                        });
                    }
                    else {
                        setItemsValues(
                            $(this),
                            nestedFig.defaultValues,
                            nestedFig.repeaters || []
                        );
                    }
                });
            });

        };

        var $list = this.getList();
        $list.append($item);

        this.setIndexes(this.getItems(), this.getGroupName(), fig.repeaters);
        $item.find('[name]').each(function () {
            $(this).inputClear();
        });
        setItemsValues($item, data || fig.defaultValues, fig.repeaters);
     },

    addItem: function (data) {
        var fig = this.fig(),
            $item = fig.itemTemplate.clone();

        this.appendItem($item, data);

        if(fig.repeaters) {
            this.initNested($item);
        }

        fig.show.call($item.get(0));
    },

    init: function() {
        var fig = this.fig(),
            container = fig.container;
        
        var $list = this.getList();


        if(fig.isFirstItemUndeletable) {
            this.filterNested(
                this.filterNested($list.find('[data-repeater-item]'), fig.repeaters)
                .first().find('[data-repeater-delete]'),
                fig.repeaters
            ).remove();
        }

        this.setIndexes(this.getItems(), this.getGroupName(), fig.repeaters);
        this.initNested(this.getItems());

        if(fig.initEmpty) {
            this.getItems().remove();
        }

        if(fig.ready) {
            fig.ready(function () {
                fig.API.setIndexes(fig.API.getItems(), fig.API.getGroupName(), fig.repeaters);
            });
        }

        this.filterNested(container.find('[data-repeater-create]'), fig.repeaters).click(function () {
            fig.API.addItem();
        });

        container.on('click', '[data-repeater-delete]', function () {
            var self = $(this).closest('[data-repeater-item]').get(0);
            fig.hide.call(self, function () {
                $(self).remove();
                fig.API.setIndexes(fig.API.getItems(), fig.API.getGroupName(), fig.repeaters);
            });
        });
    }
};

$.fn.repeater.defaults = {
    initEmpty: false,
    defaultValues: [],
    isFirstItemUndeletable: false,
    repeaters: null,
    show: function() {
        $(this).show();
    },
    hide: function(removeElement) {
        removeElement();
    },
    ready: null,
}