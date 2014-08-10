// jquery.input version 0.0.0
// https://github.com/DubFriend/jquery.input
// (MIT) 09-04-2014
// Brian Detering <BDeterin@gmail.com> (http://www.briandetering.net/)
(function ($) {
'use strict';

var $getAnyForminatorModule = function (preSelector, name, moduleName) {
    return $(
        preSelector +
        (moduleName ? '-' + moduleName : '') +
        (name ? '-' + name : '')
    );
};

var $getForminatorByClass = partial($getAnyForminatorModule, '.frm');
var createBaseInput = function (fig, my) {
    var self = mixinPubSub(),
        $self = fig.$;

    self.getType = function () {
        throw 'implement me (return type. "text", "radio", etc.)';
    };

    self.$ = function (selector) {
        return selector ? $self.find(selector) : $self;
    };

    self.disable = function () {
        self.$().prop('disabled', true);
        self.publish('isEnabled', false);
    };

    self.enable = function () {
        self.$().prop('disabled', false);
        self.publish('isEnabled', true);
    };

    my.equalTo = function (a, b) {
        return a === b;
    };

    my.publishChange = (function () {
        var oldValue;
        return function (e, domElement) {
            var newValue = self.get();
            if(!my.equalTo(newValue, oldValue)) {
                self.publish('change', { e: e, domElement: domElement });
            }
            oldValue = newValue;
        };
    }());

    return self;
};


var createInput = function (fig, my) {
    var self = createBaseInput(fig, my);

    self.get = function () {
        return self.$().val();
    };

    self.set = function (newValue) {
        self.$().val(newValue);
    };

    self.clear = function () {
        self.set('');
    };

    my.buildSetter = function (callback) {
        return function (newValue) {
            callback.call(self, newValue);
        };
    };

    return self;
};

var inputEqualToArray = function (a, b) {
    a = isArray(a) ? a : [a];
    b = isArray(b) ? b : [b];

    var isEqual = true;
    if(a.length !== b.length) {
        isEqual = false;
    }
    else {
        foreach(a, function (value) {
            if(!inArray(b, value)) {
                isEqual = false;
            }
        });
    }

    return isEqual;
};

var createInputButton = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'button';
    };

    self.$().on('change', function (e) {
        my.publishChange(e, this);
    });

    return self;
};

var createInputCheckbox = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'checkbox';
    };

    self.get = function () {
        var values = [];
        self.$().filter(':checked').each(function () {
            values.push($(this).val());
        });
        return values;
    };

    self.set = function (newValues) {
        newValues = isArray(newValues) ? newValues : [newValues];

        self.$().each(function () {
            $(this).prop('checked', false);
        });

        foreach(newValues, function (value) {
            self.$().filter('[value="' + value + '"]')
                .prop('checked', true);
        });
    };

    my.equalTo = inputEqualToArray;

    self.$().change(function (e) {
        my.publishChange(e, this);
    });

    return self;
};

var createInputEmail = function (fig) {
    var my = {},
        self = createInputText(fig, my);

    self.getType = function () {
        return 'email';
    };

    return self;
};

var createInputFile = function (fig) {
    var my = {},
        self = createBaseInput(fig, my);

    self.getType = function () {
        return 'file';
    };

    self.get = function () {
        return last(self.$().val().split('\\'));
    };

    self.clear = function () {
        // http://stackoverflow.com/questions/1043957/clearing-input-type-file-using-jquery
        this.$().each(function () {
            $(this).wrap('<form>').closest('form').get(0).reset();
            $(this).unwrap();
        });
    };

    self.$().change(function (e) {
        my.publishChange(e, this);
        // self.publish('change', self);
    });

    return self;
};

var createInputHidden = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'hidden';
    };

    self.$().change(function (e) {
        my.publishChange(e, this);
    });

    return self;
};
var createInputMultipleFile = function (fig) {
    var my = {},
        self = createBaseInput(fig, my);

    self.getType = function () {
        return 'file[multiple]';
    };

    self.get = function () {
        // http://stackoverflow.com/questions/14035530/how-to-get-value-of-html-5-multiple-file-upload-variable-using-jquery
        var fileListObject = self.$().get(0).files || [],
            names = [], i;

        for(i = 0; i < (fileListObject.length || 0); i += 1) {
            names.push(fileListObject[i].name);
        }

        return names;
    };

    self.clear = function () {
        // http://stackoverflow.com/questions/1043957/clearing-input-type-file-using-jquery
        this.$().each(function () {
            $(this).wrap('<form>').closest('form').get(0).reset();
            $(this).unwrap();
        });
    };

    self.$().change(function (e) {
        my.publishChange(e, this);
    });

    return self;
};

var createInputMultipleSelect = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'select[multiple]';
    };

    self.get = function () {
        return self.$().val() || [];
    };

    self.set = function (newValues) {
        self.$().val(
            newValues === '' ? [] : isArray(newValues) ? newValues : [newValues]
        );
    };

    my.equalTo = inputEqualToArray;

    self.$().change(function (e) {
        my.publishChange(e, this);
    });

    return self;
};

var createInputPassword = function (fig) {
    var my = {},
        self = createInputText(fig, my);

    self.getType = function () {
        return 'password';
    };

    return self;
};

var createInputRadio = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'radio';
    };

    self.get = function () {
        return self.$().filter(':checked').val() || null;
    };

    self.set = function (newValue) {
        if(!newValue) {
            self.$().each(function () {
                $(this).prop('checked', false);
            });
            // self.$().prop('checked', false);
        }
        else {
            self.$().filter('[value="' + newValue + '"]').prop('checked', true);
        }
    };

    // self.set = my.buildSetter(function (newValue) {
    //     console.log('set : ', newValue, self.$());
    //     if(!newValue) {
    //         self.$().prop('checked', false);
    //     }
    //     else {
    //         self.$().filter('[value="' + newValue + '"]').prop('checked', true);
    //     }
    // });

    self.$().change(function (e) {
        my.publishChange(e, this);
    });

    return self;
};

var createInputRange = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'range';
    };

    self.$().change(function (e) {
        my.publishChange(e, this);
    });

    return self;
};

var createInputSelect = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'select';
    };

    self.$().change(function (e) {
        my.publishChange(e, this);
    });

    return self;
};

var createInputText = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'text';
    };

    self.$().on('change keyup keydown', function (e) {
        my.publishChange(e, this);
    });

    return self;
};

var createInputTextarea = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'textarea';
    };

    self.$().on('change keyup keydown', function (e) {
        my.publishChange(e, this);
    });

    return self;
};

var createInputURL = function (fig) {
    var my = {},
        self = createInputText(fig, my);

    self.getType = function () {
        return 'url';
    };

    return self;
};

var buildFormInputs = function (fig) {
    var inputs = {},
        $self = fig.$;

    var constructor = fig.constructorOverride || {
        button: createInputButton,
        text: createInputText,
        url: createInputURL,
        email: createInputEmail,
        password: createInputPassword,
        range: createInputRange,
        textarea: createInputTextarea,
        select: createInputSelect,
        'select[multiple]': createInputMultipleSelect,
        radio: createInputRadio,
        checkbox: createInputCheckbox,
        file: createInputFile,
        'file[multiple]': createInputMultipleFile,
        hidden: createInputHidden
    };

    var addInputsBasic = function (type, selector) {
        var $input = isObject(selector) ? selector : $self.find(selector);

        $input.each(function () {
            var name = $(this).attr('name');
            inputs[name] = constructor[type]({
                $: $(this)
            });
        });
    };

    var addInputsGroup = function (type, selector) {
        var names = [],
            $input = isObject(selector) ? selector : $self.find(selector);

        if(isObject(selector)) {
            inputs[$input.attr('name')] = constructor[type]({
                $: $input
            });
        }
        else {
            // group by name attribute
            $input.each(function () {
                var name = $(this).attr('name');

                if(indexOf(names, $(this).attr('name')) === -1) {
                    names.push($(this).attr('name'));
                }
            });

            foreach(names, function (name) {
                inputs[name] = constructor[type]({
                    $: $self.find('input[name="' + name + '"]')
                });
            });
        }
    };


    if($self.is('input, select, textarea')) {
        if($self.is('input[type="button"], button, input[type="submit"]')) {
            addInputsBasic('button', $self);
        }
        else if($self.is('textarea')) {
            addInputsBasic('textarea', $self);
        }
        else if($self.is('input[type="text"]')) {
            addInputsBasic('text', $self);
        }
        else if($self.is('input[type="password"]')) {
            addInputsBasic('password', $self);
        }
        else if($self.is('input[type="email"]')) {
            addInputsBasic('email', $self);
        }
        else if($self.is('input[type="url"]')) {
            addInputsBasic('url', $self);
        }
        else if($self.is('input[type="range"]')) {
            addInputsBasic('range', $self);
        }
        else if($self.is('select')) {
            if($self.is('[multiple]')) {
                addInputsBasic('select[multiple]', $self);
            }
            else {
                addInputsBasic('select', $self);
            }
        }
        else if($self.is('input[type="file"]')) {
            if($self.is('[multiple]')) {
                addInputsBasic('file[multiple]', $self);
            }
            else {
                addInputsBasic('file', $self);
            }
        }
        else if($self.is('input[type="hidden"]')) {
            addInputsBasic('hidden', $self);
        }
        else if($self.is('input[type="radio"]')) {
            addInputsGroup('radio', $self);
        }
        else if($self.is('input[type="checkbox"]')) {
            addInputsGroup('checkbox', $self);
        }
        else {
            throw 'invalid input type';
        }
    }
    else {
        addInputsBasic('button', 'input[type="button"], button, input[type="submit"]');
        addInputsBasic('text', 'input[type="text"]');
        addInputsBasic('password', 'input[type="password"]');
        addInputsBasic('email', 'input[type="email"]');
        addInputsBasic('url', 'input[type="url"]');
        addInputsBasic('range', 'input[type="range"]');
        addInputsBasic('textarea', 'textarea');
        addInputsBasic('select', 'select:not([multiple])');
        addInputsBasic('select[multiple]', 'select[multiple]');
        addInputsBasic('file', 'input[type="file"]:not([multiple])');
        addInputsBasic('file[multiple]', 'input[type="file"][multiple]');
        addInputsBasic('hidden', 'input[type="hidden"]');
        addInputsGroup('radio', 'input[type="radio"]');
        addInputsGroup('checkbox', 'input[type="checkbox"]');
    }

    return inputs;
};

var createFactory = function (fig) {
    var self = {};

    var buildModuleIfExists = function (fn, $module) {
        return function () {
            var args = argumentsToArray(arguments);
            if($module.length) {
                return fn.apply(null, [$module].concat(args));
            }
        };
    };

    self.input = {
        text: createInputText,
        textarea: createInputTextarea,
        select: createInputSelect,
        radio: createInputRadio,
        checkbox: createInputCheckbox,
        file: createInputFile,
        button: createInputButton,
        hidden: createInputHidden,
        range: createInputRange
    };

    var getMappedFormInputs = function ($form) {
        return map(
            buildFormInputs({ $: $form, factory: self }),
            function (input) {
                return createFormGroup({ input: input });
            }
        );
    };

    self.form = buildModuleIfExists(function ($module) {
        return createForm({
            $: $module,
            ajax: ajax,
            validate: fig.validate,
            url: url,
            inputs: getMappedFormInputs($module)
        });
    }, $getModuleByClass(''));

    self.list = buildModuleIfExists(function ($module, request) {
        return createList({
            $: $module,
            fieldMap: fieldMap,
            request: request,
            uniquelyIdentifyingFields: uniquelyIdentifyingFields,
            deleteConfirmation: deleteConfirmation
        });
    }, $getModuleByClass('list'));

    self.newItemButton = buildModuleIfExists(function ($module) {
        return createNewItemButton({ $: $module });
    }, $getModuleByClass('new'));

    self.request = function () {
        return createRequest({
            ajax: function (fig) {
                $.ajax(fig);
            },
            url: url
        });
    };

    self.search = buildModuleIfExists(function ($module, request) {
        return createSearch({
            $: $module,
            isInstantSearch: fig.isInstantSearch === false ? false : true,
            request: request,
            inputs: getMappedFormInputs($module)
        });
    }, $getModuleByClass('search'));

    self.ordinator = buildModuleIfExists(function ($module, request) {
        return createOrdinator({
            $: $module,
            request: request,
            orderIcons: fig.orderIcons
        });
    }, $getModuleByClass('ordinator'));

    self.paginator = function (request) {
        return createPaginator({
            name: name,
            request: request,
            gotoPage: self.gotoPage()
        });
    };

    self.gotoPage = buildModuleIfExists(function ($module) {
        return createGotoPage({
            $: $module,
            inputs: getMappedFormInputs($module)
        });
    }, $getModuleByClass('goto-page'));

    return self;
};

$.fn.inputVal = function (newValue) {
    var $self = $(this);

    var inputs = buildFormInputs({ $: $self });

    if($self.is('input, textarea, select')) {
        if(typeof newValue === 'undefined') {
            return inputs[$self.attr('name')].get();
        }
        else {
            inputs[$self.attr('name')].set(newValue);
            return $self;
        }
    }
    else {
        if(typeof newValue === 'undefined') {
            return call(inputs, 'get');
        }
        else {
            foreach(newValue, function (value, inputName) {
                inputs[inputName].set(value);
            });
            return $self;
        }
    }
};

$.fn.inputOnChange = function (callback) {
    var $self = $(this);
    var inputs = buildFormInputs({ $: $self });
    foreach(inputs, function (input) {
        input.subscribe('change', function (data) {
            callback.call(data.domElement, data.e);
        });
    });
    return $self;
};

$.fn.inputDisable = function () {
    var $self = $(this);
    call(buildFormInputs({ $: $self }), 'disable');
    return $self;
};

$.fn.inputEnable = function () {
    var $self = $(this);
    call(buildFormInputs({ $: $self }), 'enable');
    return $self;
};

$.fn.inputClear = function () {
    var $self = $(this);
    call(buildFormInputs({ $: $self }), 'clear');
    return $self;
};

}(jQuery));
