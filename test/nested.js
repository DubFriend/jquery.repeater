QUnit.module('nested-repeater', {
    setup: function () {
        this.$fixture = $('#qunit-fixture');
        this.$fixture.html($('#template').html());
        this.$outerRepeater = this.$fixture.find('.outer-repeater');
        this.$innerRepeater = this.$fixture.find('.inner-repeater');
        // this.$outerList = this.$fixture.find('[data-repeater-list="outer-group"]');
        this.$outerAddButton = this.$fixture.find('.outer-repeater > [data-repeater-create]');
        this.$innerAddButton = this.$fixture.find('.inner-repeater > [data-repeater-create]');
    }
});


QUnit.test('add item nested outer', function (assert) {
    this.$outerRepeater.repeater({ repeater: {} });
    this.$outerAddButton.click();
    var $items = this.$outerRepeater.find('[data-repeater-list="outer-group"] > [data-repeater-item]');
    // console.log(this.$outerRepeater.html());
    console.log(JSON.stringify(getNamedInputValues($items.first()), null, 2));
    assert.strictEqual($items.length, 2, 'adds a second item to list');
    assert.strictEqual(
        $items.first().find('[data-repeater-list="inner-group"] > [data-repeater-item]').length,
        1, 'does not duplicate first inner repeater'
    );
    assert.strictEqual(
        $items.last().find('[data-repeater-list="inner-group"] > [data-repeater-item]').length,
        1, 'does not duplicate last inner repeater'
    );

    // var $items = this.$repeater.find('[data-repeater-item]');
    // assert.strictEqual($items.length, 3, 'adds a third item to list');

    // assert.deepEqual(
    //     getNamedInputValues($items.last()),
    //     generateNameMappedInputValues('a', 2, ''),
    //     'added items inputs are clear'
    // );
    //
    // assert.deepEqual(
    //     getNamedInputValues($items.first()),
    //     generateNameMappedInputValues('a', 0, 'A', {
    //         "group-a[0][multiple-select-input][]": ['A', 'B']
    //     }),
    //     'does not clear other inputs'
    // );
    //
    // assert.strictEqual(
    //     this.$secondRepeater.find('[data-repeater-item]').length,
    //     2,
    //     'does not add third item to second repeater'
    // );
});
