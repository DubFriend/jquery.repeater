QUnit.module('repeater', {
    setup: function () {
        this.$fixture = $('#qunit-fixture');
        this.$fixture.html($('#template').html());
        this.$repeater = this.$fixture.find('.repeater');
        this.$addButton = this.$fixture.find('[data-repeater-create]');
    }
});

QUnit.asyncTest('server echo\'s post data', function (assert) {
    expect(1);
    $.ajax({
        url: 'http://localhost/jquery.repeater/test/echo.php',
        type: 'POST',
        data: { foo: 'bar' },
        dataType: 'json',
        success: function (response) {
            assert.deepEqual(response, { foo: 'bar' });
            QUnit.start();
        },
        error: function (xhr) {
            console.error('ERROR', xhr.responseText);
            QUnit.start();
        }
    });
});

var getNamedInputValues = function ($scope) {
    return filter($scope.inputVal(), function (val, key) {
        return key !== 'undefined';
    });
};

var generateNameMappedInputValues = function (index, defaultValue, override) {
    var defaultObject = {};
    defaultObject['group-a[' + index + '][text-input]'] = defaultValue;
    defaultObject['group-a[' + index + '][textarea-input]'] = defaultValue;
    defaultObject['group-a[' + index + '][select-input]'] = defaultValue || null;
    defaultObject['group-a[' + index + '][radio-input]'] = defaultValue || null;
    defaultObject['group-a[' + index + '][checkbox-input]'] = defaultValue ? [defaultValue] : [];
    return $.extend(defaultObject, override || {});
};

QUnit.test('add item', function (assert) {
    this.$repeater.repeater();
    this.$addButton.click();
    var self = this;
    var $items = self.$repeater.find('[data-repeater-item]');
    assert.strictEqual($items.length, 3, 'adds a third item to list');
    assert.deepEqual(
        getNamedInputValues($items.last()),
        generateNameMappedInputValues(2, ''),
        'added items inputs are clear'
    );

    assert.deepEqual(
        getNamedInputValues($items.first()),
        generateNameMappedInputValues(0, 'A'),
        'does not clear other inputs'
    );
});

QUnit.test('add item with default values and rewrite names', function (assert) {
    this.$repeater.repeater({
        defaultValues: { 'text-input': 'foo' }
    });
    this.$addButton.click();
    assert.deepEqual(
        getNamedInputValues(this.$repeater.find('[data-repeater-item]').last()),
        generateNameMappedInputValues(2, '', { 'group-a[2][text-input]': 'foo' })
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
        generateNameMappedInputValues(0, 'B'),
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
        generateNameMappedInputValues(1, 'B'),
        'second input remains'
    );
});

QUnit.asyncTest('custom show callback', function (assert) {
    expect(2);
    this.$repeater.repeater({
        show: function () {
            assert.deepEqual(
                getNamedInputValues($(this)),
                generateNameMappedInputValues(2, ''),
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
                generateNameMappedInputValues(0, 'A'),
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