var getNamedInputValues = function ($scope) {
    return filter($scope.inputVal(), function (val, key) {
        return key !== 'undefined';
    });
};

var generateNameMappedInputValues = function (group, index, defaultValue, override) {
    var defaultObject = {};
    defaultObject['group-' + group + '[' + index + '][text-input]'] = defaultValue;
    defaultObject['group-' + group + '[' + index + '][date-input]'] = defaultValue;
    defaultObject['group-' + group + '[' + index + '][url-input]'] = defaultValue;
    defaultObject['group-' + group + '[' + index + '][color-input]'] = defaultValue || '#000000';
    defaultObject['group-' + group + '[' + index + '][datetime-local-input]'] = defaultValue;
    defaultObject['group-' + group + '[' + index + '][month-input]'] = defaultValue;
    defaultObject['group-' + group + '[' + index + '][number-input]'] = defaultValue;
    defaultObject['group-' + group + '[' + index + '][search-input]'] = defaultValue;
    defaultObject['group-' + group + '[' + index + '][tel-input]'] = defaultValue;
    defaultObject['group-' + group + '[' + index + '][time-input]'] = defaultValue;
    defaultObject['group-' + group + '[' + index + '][week-input]'] = defaultValue;
    defaultObject['group-' + group + '[' + index + '][textarea-input]'] = defaultValue;
    defaultObject['group-' + group + '[' + index + '][select-input]'] = defaultValue || null;
    defaultObject['group-' + group + '[' + index + '][radio-input]'] = defaultValue || null;
    defaultObject['group-' + group + '[' + index + '][checkbox-input][]'] = defaultValue ? [defaultValue] : [];
    defaultObject['group-' + group + '[' + index + '][multiple-select-input][]'] = defaultValue ? [defaultValue] : [];
    return $.extend(defaultObject, override || {});
};
