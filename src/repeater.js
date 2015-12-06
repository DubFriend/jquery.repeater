$.fn.repeaterVal = function () {
    var rawData = $(this).inputVal();
    var mapped = {};

    foreach(rawData, function (val, key) {
        var group, index, name;
        var matches;
        if(key !== "undefined") {
            matches = key.match(/^([^\[]+)\[([0-9]+)\]\[([^\]]+)/);
            group = matches[1];
            index = matches[2];
            name = matches[3];
            if(!mapped[group]) {
                mapped[group] = [];
            }

            if(!mapped[group][index]) {
                mapped[group][index] = {};
            }

            mapped[group][index][name] = val;
        }
    });

    return mapped;
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
            repeaters = repeaters || fig.repeaters;
            return $items.filter(function () {
                return repeaters ?
                    $(this).closest(
                        pluck(repeaters, 'selector').join(',')
                    ).length === 0 : true;
            });
        };

        var $items = function () {
            return $filterNested($list.find('[data-repeater-item]'));
        };

        var $itemTemplate = $list.find('[data-repeater-item]')
                                 .first().clone().hide();

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

        var setIndexes = function ($items, groupName, repeaters) {
            $items.each(function (index) {
                var $item = $(this);
                $item.data('item-name', groupName + '[' + index + ']');
                $filterNested($item.find('[name]'), repeaters || [])
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

                    if(repeaters) {
                        foreach(repeaters, function (nestedFig) {
                            var $repeater = $item.find(nestedFig.selector);

                            setIndexes(
                                $filterNested($repeater.find('[data-repeater-item]'), nestedFig.repeaters || []),
                                groupName + '[' + index + ']' +
                                            '[' + $repeater.find('[data-repeater-list]').first().data('repeater-list') + ']',
                                nestedFig.repeaters
                            );
                        });
                    }
                });
            });

            $list.find('input[name][checked]')
                .removeAttr('checked')
                .prop('checked', true);
        };

        setIndexes($items(), getGroupName(), fig.repeaters);
        initNested($items());

        if(fig.ready) {
            fig.ready(function () {
                setIndexes($items(), getGroupName(), fig.repeaters);
            });
        }

        var setItemsValues = function ($item, values) {
            var index;
            index = $item.find('[name]').first()
                .attr('name').match(/\[([0-9]*)\]/)[1];

            $item.inputVal(map(values, identity, function (name) {
                var nameIfNotCheckbox = getGroupName() + '[' + index + '][' + name + ']';
                return $item.find('[name="' + nameIfNotCheckbox + '"]').length ?
                    nameIfNotCheckbox : nameIfNotCheckbox + '[]';
            }));
        };

        var appendItem = (function () {
            var setupTemplate = function ($item) {
                var defaultValues = fig.defaultValues;

                $item.find('[name]').each(function () {
                    $(this).inputClear();
                });

                if(defaultValues) {
                    setItemsValues($item, defaultValues);
                }
            };

            return function ($item) {
                $list.append($item);
                setIndexes($items(), getGroupName(), fig.repeaters);
                setupTemplate($item);
            };
        }());

        var addItem = function () {
            var $item = $itemTemplate.clone();
            appendItem($item);
            show.call($item.get(0));
        };

        $self.children().each(function () {
            if(
                !$(this).is('[data-repeater-list]') &&
                $(this).find('[data-repeater-list]').length === 0
            ) {
                if($(this).is('[data-repeater-create]')) {
                    $(this).click(addItem);
                }
                else if($(this).find('[data-repeater-create]').length !== 0) {
                    $(this).find('[data-repeater-create]').click(addItem);
                }
            }
        });

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
