QUnit.module('repeater', {
    setup: function () {
        this.$fixture = $('#qunit-fixture');
        this.$fixture.html($('#template').html());
        this.$repeater = this.$fixture.find('.repeater');
        this.$addButton = this.$repeater.find('[data-repeater-create]');

        this.$fixture.append($('#template').html());
        this.$secondRepeater = this.$fixture.find('.repeater').last();
        this.$secondRepeater.find('[data-repeater-list]').data(
            'repeater-list', 'group-b'
        );
        this.$secondRepeaterAddButton = this.$secondRepeater.find('[data-repeater-create]');
    }
});

QUnit.test('add item', function (assert) {
    this.$repeater.repeater();
    this.$secondRepeater.repeater();
    this.$addButton.click();
    var $items = this.$repeater.find('[data-repeater-item]');
    assert.strictEqual($items.length, 3, 'adds a third item to list');

    assert.deepEqual(
        getNamedInputValues($items.last()),
        generateNameMappedInputValues('a', 2, ''),
        'added items inputs are clear'
    );

    assert.deepEqual(
        getNamedInputValues($items.first()),
        generateNameMappedInputValues('a', 0, 'A', {
            "group-a[0][multiple-select-input][]": ['A', 'B'],
            "group-a[0][color-input]":"#aaaaaa",
            "group-a[0][date-input]":"2018-05-01",
            "group-a[0][datetime-local-input]":"2018-05-12T19:30",
            "group-a[0][month-input]":"2018-05",
            "group-a[0][number-input]":"42",
            "group-a[0][tel-input]":"1112223333",
            "group-a[0][time-input]":"13:30",
            "group-a[0][url-input]":"https://exemple.com/a",
            "group-a[0][week-input]":"2018-W26",
        }),
        'does not clear other inputs'
    );

    assert.strictEqual(
        this.$secondRepeater.find('[data-repeater-item]').length,
        2,
        'does not add third item to second repeater'
    );
});

QUnit.test('instantiate with no first item', function (assert) {
    this.$repeater.find('[data-repeater-item]').last().remove();
    this.$repeater.find('[data-repeater-item]').css('display', 'none');
    assert.strictEqual(
        this.$repeater.find('[data-repeater-item]').css('display'), 'none',
        'display:none css is set'
    );
    this.$repeater.repeater({ initEmpty: true });
    assert.strictEqual(
        this.$repeater.find('[data-repeater-item]').length, 0,
        'starts with no items'
    );
    this.$addButton.click();
    assert.strictEqual(
        this.$repeater.find('[data-repeater-item]').length, 1,
        'still able to create item'
    );

    assert.strictEqual(
        this.$repeater.find('[data-repeater-item]').css('display'), 'block',
        'display:none css is not set'
    );

    assert.deepEqual(
        getNamedInputValues(this.$repeater.find('[data-repeater-item]')),
        generateNameMappedInputValues('a', 0, '', {
            "group-a[0][multiple-select-input][]": []
        }),
        'maintains template'
    );
});

QUnit.test('instantiate group of repeaters with a single repeater() call', function (assert) {
    this.$fixture.find('.repeater').repeater();
    this.$addButton.click();
    var $items = this.$secondRepeater.find('[data-repeater-item]');
    assert.strictEqual(
        $items.length, 2,
        'does not add a third item to unclicked list'
    );
});

QUnit.test('second repeater add item', function (assert) {
    this.$repeater.repeater();
    this.$secondRepeater.repeater();
    this.$secondRepeaterAddButton.click();
    var $items = this.$secondRepeater.find('[data-repeater-item]');
    assert.strictEqual($items.length, 3, 'adds a third item to list');
    assert.deepEqual(
        getNamedInputValues($items.last()),
        generateNameMappedInputValues('b', 2, ''),
        'added items inputs are clear'
    );

    assert.deepEqual(
        getNamedInputValues($items.first()),
        generateNameMappedInputValues('b', 0, 'A', {
            "group-b[0][multiple-select-input][]": ['A', 'B'],
            "group-b[0][color-input]":"#aaaaaa",
            "group-b[0][date-input]":"2018-05-01",
            "group-b[0][datetime-local-input]":"2018-05-12T19:30",
            "group-b[0][month-input]":"2018-05",
            "group-b[0][number-input]":"42",
            "group-b[0][tel-input]":"1112223333",
            "group-b[0][time-input]":"13:30",
            "group-b[0][url-input]":"https://exemple.com/a",
            "group-b[0][week-input]":"2018-W26",
        }),
        'does not clear other inputs'
    );

    assert.strictEqual(
        this.$repeater.find('[data-repeater-item]').length,
        2,
        'does not add third item to first repeater'
    );
});

QUnit.test('multiple add buttons', function (assert) {
    this.$repeater.append(
        '<div data-repeater-create class="second-add">' +
            'Another Add Button' +
        '</div>'
    );
    this.$repeater.repeater();
    this.$repeater.find('.second-add').click();
    var $items = this.$repeater.find('[data-repeater-item]');
    assert.strictEqual($items.length, 3, 'adds a third item to list');
    assert.deepEqual(
        getNamedInputValues($items.last()),
        generateNameMappedInputValues('a', 2, ''),
        'added items inputs are clear'
    );

    assert.deepEqual(
        getNamedInputValues($items.first()),
        generateNameMappedInputValues('a', 0, 'A', {
            "group-a[0][multiple-select-input][]": ['A', 'B'],
            "group-a[0][color-input]":"#aaaaaa",
            "group-a[0][date-input]":"2018-05-01",
            "group-a[0][datetime-local-input]":"2018-05-12T19:30",
            "group-a[0][month-input]":"2018-05",
            "group-a[0][number-input]":"42",
            "group-a[0][tel-input]":"1112223333",
            "group-a[0][time-input]":"13:30",
            "group-a[0][url-input]":"https://exemple.com/a",
            "group-a[0][week-input]":"2018-W26",
        }),
        'does not clear other inputs'
    );
});

QUnit.test('add item with default values and rewrite names', function (assert) {
    this.$repeater.repeater({
        defaultValues: {
            'text-input': 'foo',
            'checkbox-input': ['A', 'B'],
            "multiple-select-input": ['B']
        }
    });
    this.$addButton.click();
    assert.deepEqual(
        getNamedInputValues(this.$repeater.find('[data-repeater-item]').last()),
        generateNameMappedInputValues('a', 2, '', {
            'group-a[2][text-input]': 'foo',
            'group-a[2][checkbox-input][]' : ['A', 'B'],
            "group-a[2][multiple-select-input][]": ['B']
        })
    );
});

QUnit.test('delete item', function (assert) {
    this.$repeater.repeater();
    this.$repeater.find('[data-repeater-delete]').first().click();
    assert.strictEqual(
        this.$repeater.find('[data-repeater-item]').length, 1,
        'only one item remains'
    );
    assert.deepEqual(
        getNamedInputValues(this.$repeater),
        generateNameMappedInputValues('a', 0, 'B', {
            "group-a[0][multiple-select-input][]": ['A', 'B'],
            "group-a[0][color-input]":"#bbbbbb",
            "group-a[0][date-input]":"2019-05-01",
            "group-a[0][datetime-local-input]":"2019-05-12T19:30",
            "group-a[0][month-input]":"2019-05",
            "group-a[0][number-input]":"43",
            "group-a[0][tel-input]":"4442223333",
            "group-a[0][time-input]":"14:30",
            "group-a[0][url-input]":"https://exemple.com/b",
            "group-a[0][week-input]":"2019-W26",
        }),
        'second input remains and reindexed as first element'
    );
});

QUnit.test('delete item that has been added', function (assert) {
    this.$repeater.repeater();
    this.$addButton.click();
    assert.strictEqual(
        this.$repeater.find('[data-repeater-item]').length, 3,
        'item added'
    );
    this.$repeater.find('[data-repeater-delete]').last().click();
    assert.strictEqual(
        this.$repeater.find('[data-repeater-item]').length, 2,
        'item deleted'
    );
    assert.deepEqual(
        getNamedInputValues(this.$repeater.find('[data-repeater-item]').last()),
        generateNameMappedInputValues('a', 1, 'B', {
            "group-a[1][multiple-select-input][]": ['A', 'B'],
            "group-a[1][color-input]":"#bbbbbb",
            "group-a[1][date-input]":"2019-05-01",
            "group-a[1][datetime-local-input]":"2019-05-12T19:30",
            "group-a[1][month-input]":"2019-05",
            "group-a[1][number-input]":"43",
            "group-a[1][tel-input]":"4442223333",
            "group-a[1][time-input]":"14:30",
            "group-a[1][url-input]":"https://exemple.com/b",
            "group-a[1][week-input]":"2019-W26",
        }),
        'second input remains'
    );
});

QUnit.asyncTest('custom show callback', function (assert) {
    expect(2);
    this.$repeater.repeater({
        show: function () {
            assert.deepEqual(
                getNamedInputValues($(this)),
                generateNameMappedInputValues('a', 2, ''),
                '"this" set to blank element'
            );
            assert.strictEqual($(this).is(':hidden'), true, 'element is hidden');
            QUnit.start();
        }
    });
    this.$addButton.click();
});

QUnit.asyncTest('custom hide callback', function (assert) {
    expect(5);
    var $repeater = this.$repeater;
    $repeater.repeater({
        hide: function (removeItem) {
            assert.strictEqual($(this).length, 1, 'has one element');
            assert.deepEqual(
                getNamedInputValues($(this)),
                generateNameMappedInputValues('a', 0, 'A',{
                    "group-a[0][multiple-select-input][]": ['A', 'B'],
                    "group-a[0][color-input]":"#aaaaaa",
                    "group-a[0][date-input]":"2018-05-01",
                    "group-a[0][datetime-local-input]":"2018-05-12T19:30",
                    "group-a[0][month-input]":"2018-05",
                    "group-a[0][number-input]":"42",
                    "group-a[0][tel-input]":"1112223333",
                    "group-a[0][time-input]":"13:30",
                    "group-a[0][url-input]":"https://exemple.com/a",
                    "group-a[0][week-input]":"2018-W26",
                }),
                '"this" is set to first element'
            );
            assert.strictEqual(
                $(this).is(':hidden'), false,
                'element is not hidden'
            );
            assert.ok($.contains(document, this), 'element is attached to dom');
            removeItem();
            assert.ok(!$.contains(document, this), 'element is detached from dom');
            QUnit.start();
        }
    });
    this.$repeater.find('[data-repeater-item]').first()
        .find('[data-repeater-delete]').click();
});

QUnit.test('isFirstItemUndeletable configuration option', function (assert) {
    this.$repeater.repeater({ isFirstItemUndeletable: true });

    var $firstDeleteButton = this.$repeater.find('[data-repeater-item]')
                                        .first().find('[data-repeater-delete]');

    assert.strictEqual($firstDeleteButton.length, 0, 'first delete button is removed');
});

QUnit.asyncTest('has ready callback option and setIndexes', function (assert) {
    expect(3);
    var $list = this.$secondRepeater.find('[data-repeater-list]');
    this.$secondRepeater.repeater({
        ready: function (setIndexes) {
            assert.ok(isFunction(setIndexes), 'passed setIndexes function');
            var $lastItem = $list.find('[data-repeater-item]').last();
            $list.prepend($lastItem.clone());
            $lastItem.remove();
            setIndexes();

            var indeces = $list.find('[name]').map(function () {
                return $(this).attr('name').match(/\[([0-9])+\]/)[1];
            }).get();

            assert.strictEqual(indeces[0], '0');
            assert.strictEqual(indeces[19], '1');

            QUnit.start();
        }
    });
});

QUnit.test('repeaterVal', function (assert) {
    this.$repeater.repeater();
    assert.deepEqual(this.$repeater.repeaterVal(), {
        "group-a": [
            {
                "text-input": "A",
                "date-input": "2018-05-01",
                "url-input": "https://exemple.com/a",
                "color-input": "#aaaaaa",
                "datetime-local-input": "2018-05-12T19:30",
                "month-input": "2018-05",
                "number-input": "42",
                "search-input": "A",
                "tel-input": "1112223333",
                "time-input": "13:30",
                "week-input": "2018-W26",
                "textarea-input": "A",
                "select-input": "A",
                "multiple-select-input": ["A", "B"],
                "radio-input": "A",
                "checkbox-input": ["A"]
            },
            {
                "text-input": "B",
                "date-input": "2019-05-01",
                "url-input": "https://exemple.com/b",
                "color-input": "#bbbbbb",
                "datetime-local-input": "2019-05-12T19:30",
                "month-input": "2019-05",
                "number-input": "43",
                "search-input": "B",
                "tel-input": "4442223333",
                "time-input": "14:30",
                "week-input": "2019-W26",
                "textarea-input": "B",
                "select-input": "B",
                "multiple-select-input": ["A", "B"],
                "radio-input": "B",
                "checkbox-input": ["B"]
            }
        ]
    });
});
