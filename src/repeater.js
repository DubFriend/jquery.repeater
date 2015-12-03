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

        var $itemTemplate = $list.find('[data-repeater-item]')
                                 .first().clone().hide();

        var $firstDeleteButton = $(this).find('[data-repeater-item]').first()
                                        .find('[data-repeater-delete]');

        if(fig.isFirstItemUndeletable && $firstDeleteButton) {
            $firstDeleteButton.remove();
        }

        var groupName = $list.data('repeater-list');

        var setIndexes = function () {
            $list.find('[data-repeater-item]').each(function (index) {
                $(this).find('[name]').each(function () {
                    // match non empty brackets (ex: "[foo]")
                    var matches = $(this).attr('name').match(/\[[^\]]+\]/g);

                    var name = matches ?
                        // strip "[" and "]" characters
                        last(matches).replace(/\[|\]/g, '') :
                        $(this).attr('name');

                    var newName = groupName + '[' + index + '][' + name + ']' +
                        ($(this).is(':checkbox') || $(this).attr('multiple') ? '[]' : '');

                    $(this).attr('name', newName);
                });
            });

            $list.find('input[name][checked]')
                .removeAttr('checked')
                .prop('checked', true);
        };

        setIndexes();

        if(fig.ready) {
            fig.ready(setIndexes);
        }

        var setItemsValues = function ($item, values) {
            var index;
            index = $item.find('[name]').first()
                .attr('name').match(/\[([0-9]*)\]/)[1];

            $item.inputVal(map(values, identity, function (name) {
                var nameIfNotCheckbox = groupName + '[' + index + '][' + name + ']';
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
                setIndexes();
                setupTemplate($item);
            };
        }());



        // $self.find('[data-repeater-create]').click(function () {
        // $self.children().filter(function () {
        //     return !$(this).is('[data-repeater-list]') &&
        //             $(this).find('[data-repeater-list]').length === 0;
        // })
        //     var $item = $itemTemplate.clone();
        //     appendItem($item);
        //     show.call($item.get(0));
        // });

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

            // !$(this).is('[data-repeater-list]') &&
            // $(this).find('[data-repeater-list]').length === 0 &&
            // ($(this).is('[data-repeater-create]') || $(this).find('[]'))
            // if(
            //
            // )
        });


        $list.on('click', '[data-repeater-delete]', function () {
            var self = $(this).closest('[data-repeater-item]').get(0);
            hide.call(self, function () {
                $(self).remove();
                setIndexes();
            });
        });
    });

    return this;
};
