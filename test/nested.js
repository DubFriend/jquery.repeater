QUnit.module('nested-repeater', {
    setup: function () {
        this.$fixture = $('#qunit-fixture');
        this.$fixture.html($('#template').html());
        this.$outerRepeater = this.$fixture.find('.outer-repeater');
        this.$innerRepeater = this.$fixture.find('.inner-repeater');
        this.$outerAddButton = this.$fixture.find('.outer-repeater > [data-repeater-create]');
        this.$innerAddButton = this.$fixture.find('.inner-repeater > [data-repeater-create]');
    }
});


QUnit.test('add item nested outer', function (assert) {
    this.$outerRepeater.repeater({ repeaters: [{ selector: '.inner-repeater' }] });
    this.$outerAddButton.click();
    var $items = this.$outerRepeater.find('[data-repeater-list="outer-group"] > [data-repeater-item]');

    assert.strictEqual($items.length, 2, 'adds a second item to list');

    assert.strictEqual(
        $items.first().find('[data-repeater-list="inner-group"] > [data-repeater-item]').length,
        1, 'does not duplicate first inner repeater'
    );

    assert.strictEqual(
        $items.last().find('[data-repeater-list="inner-group"] > [data-repeater-item]').length,
        1, 'does not duplicate last inner repeater'
    );

    assert.deepEqual(
        getNamedInputValues($items.first()),
        {
            "outer-group[0][text-input]": "A",
            "outer-group[0][inner-group][0][inner-text-input]": "B"
        },
        'renamed first item'
    );

    assert.deepEqual(
        getNamedInputValues($items.last()),
        {
            "outer-group[1][text-input]": "",
            "outer-group[1][inner-group][0][inner-text-input]": ""
        },
        'renamed last item, values cleared'
    );
});

QUnit.test('add item nested inner', function (assert) {
    this.$outerRepeater.repeater({ repeaters: [{ selector: '.inner-repeater' }] });
    this.$innerAddButton.click();

    assert.strictEqual(
        this.$innerRepeater.find('[data-repeater-item]').length,
        2, 'adds item to inner repeater'
    );

    var $items = this.$outerRepeater.find('[data-repeater-list="outer-group"] > [data-repeater-item]');

    assert.strictEqual($items.length, 1, 'does not add item to outer list');

    assert.deepEqual(
        getNamedInputValues($items.first()),
        {
            "outer-group[0][text-input]": "A",
            "outer-group[0][inner-group][0][inner-text-input]": "B",
            "outer-group[0][inner-group][1][inner-text-input]": "",
        },
        'renamed items'
    );
});
