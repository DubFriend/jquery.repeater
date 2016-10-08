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

$.fn.repeater = function (fig) {
    fig = fig || {};

    $(this).each(function () {

        var $self = $(this);

        var show = fig.show || function () {
            $(this).show();
        };

        var hide = fig.hide || function (removeElement) {
            removeElement();
        };

        var $list = $self.find('[data-repeater-list]').first();

        var $filterNested = function ($items, repeaters) {
            return $items.filter(function () {
                return repeaters ?
                    $(this).closest(
                        pluck(repeaters, 'selector').join(',')
                    ).length === 0 : true;
            });
        };

        var $items = function () {
            return $filterNested($list.find('[data-repeater-item]'), fig.repeaters);
        };

        var $itemTemplate = $list.find('[data-repeater-item]')
                                 .first().clone().hide();

        // if(fig.initEmpty) {
        //     $itemTemplate.css('display', '');
        // }

        var $firstDeleteButton = $(this).find('[data-repeater-item]').first()
                                        .find('[data-repeater-delete]');

        if(fig.isFirstItemUndeletable && $firstDeleteButton) {
            $firstDeleteButton.remove();
        }

        var getGroupName = function () {
            var groupName = $list.data('repeater-list');
            return fig.$parent ?
                fig.$parent.data('item-name') + '[' + groupName + ']' :
                groupName;
        };

        var initNested = function ($listItems) {
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
        };

        var $foreachRepeaterInItem = function (repeaters, $item, cb) {
            if(repeaters) {
                foreach(repeaters, function (nestedFig) {
                    cb.call($item.find(nestedFig.selector)[0], nestedFig);
                });
            }
        };

        

        setIndexes($items(), getGroupName(), fig.repeaters);
        initNested($items());
        if(fig.initEmpty) {
            $items().remove();
        }

        if(fig.ready) {
            fig.ready(function () {
                setIndexes($items(), getGroupName(), fig.repeaters);
            });
        }

        var setIndexes = function ($items, groupName, repeaters) {
                $items.each(function (index) {
                    var $item = $(this);
                    var subjects = $.merge($item.find('[name]'), $item.find('label'));
                    $item.data('item-name', groupName + '[' + index + ']');

                    $filterNested(subjects, repeaters)
                        .each(function () {
                            var $input = $(this);
                            var name = $input.is('label') ? $input.attr('for') : $input.attr('name');

                            // match non empty brackets (ex: "[foo]")
                            var matches = name.match(/\[[^\]]+\]/g);

                            name = matches ?
                                // strip "[" and "]" characters
                                last(matches).replace(/\[|\]/g, '') :
                                name;

                            var newName = groupName + '[' + index + '][' + name + ']' +
                                ($input.is(':checkbox') || $input.attr('multiple') ? '[]' : '');

                            if ($input.is('label')) {
                                $input.attr('for', newName);
                            } else {
                                $input.attr('name', newName);
                            }

                            $foreachRepeaterInItem(repeaters, $item, function (nestedFig) {
                                var $repeater = $(this);
                                setIndexes(
                                    $filterNested($repeater.find('[data-repeater-item]'), nestedFig.repeaters || []),
                                    groupName + '[' + index + ']' +
                                    '[' + $repeater.find('[data-repeater-list]').first().data('repeater-list') + ']',
                                    nestedFig.repeaters
                                );
                            });
                        });
                });

                $list.find('input[name][checked]')
                    .removeAttr('checked')
                    .prop('checked', true);
            };

        var appendItem = (function () {
            var setItemsValues = function ($item, values, repeaters) {
                if(values) {
                    var inputNames = {};
                    $filterNested($item.find('[name]'), repeaters).each(function () {
                        var key = $(this).attr('name').match(/\[([^\]]*)(\]|\]\[\])$/)[1];
                        inputNames[key] = $(this).attr('name');
                    });

                    $item.inputVal(map(values, identity, function (name) {
                        return inputNames[name];
                    }));
                }

                $foreachRepeaterInItem(repeaters, $item, function (nestedFig) {
                    var $repeater = $(this);
                    $filterNested(
                        $repeater.find('[data-repeater-item]'),
                        nestedFig.repeaters
                    )
                    .each(function () {
                        setItemsValues(
                            $(this),
                            nestedFig.defaultValues,
                            nestedFig.repeaters || []
                        );
                    });
                });
            };

            return function ($item) {
                $list.append($item);
                setIndexes($items(), getGroupName(), fig.repeaters);
                $item.find('[name]').each(function () {
                    $(this).inputClear();
                });
                setItemsValues($item, fig.defaultValues, fig.repeaters);
            };
        }());

        var addItem = function () {
            var $item = $itemTemplate.clone();
            appendItem($item);
            if(fig.repeaters) {
                initNested($item);
            }
            show.call($item.get(0));
        };

        $filterNested($self.find('[data-repeater-create]'), fig.repeaters).click(addItem);

        $list.on('click', '[data-repeater-delete]', function () {
            var self = $(this).closest('[data-repeater-item]').get(0);
            hide.call(self, function () {
                $(self).remove();
                setIndexes($items(), getGroupName(), fig.repeaters);
            });
        });
    });

    return this;
};
