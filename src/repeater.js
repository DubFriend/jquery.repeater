$.fn.repeater = function(fig) {
    fig = fig || {};

    var $self = this;

    var show = fig.show || function () {
        $(this).show();
    };

    var hide = fig.hide || function (removeElement) {
        removeElement();
    };

    var $list = $self.find('[data-repeater-list]');

    var $itemTemplate = $list.find('[data-repeater-item]')
            .first().clone().hide();

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
                    ($(this).is(':checkbox') ? '[]' : '');

                $(this).attr('name', newName);
            });
        });

        $list.find('input[name][checked]')
            .removeAttr('checked')
            .prop('checked', true);
    };

    setIndexes();

    var setItemsValues = function ($item, values) {
        var index;
        index = $item.find('[name]').first()
            .attr('name').match(/\[([0-9]*)\]/)[1];

        $item.inputVal(map(values, identity, function (name) {
            return groupName + '[' + index + '][' + name + ']';
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

    $self.find('[data-repeater-create]').click(function () {
        var $item = $itemTemplate.clone();
        appendItem($item);
        show.call($item.get(0));
    });

    $list.on('click', '[data-repeater-delete]', function () {
        var self = $(this).closest('[data-repeater-item]').get(0);
        hide.call(self, function () {
            $(self).remove();
            setIndexes();
        });
    });

    return this;
};