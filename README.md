#Repeater

Creates an interface to add and remove a repeatable group of input elements.

###[Demo](http://briandetering.net/repeater)

`bower install jquery.repeater --save`
`npm install jquery.repeater --save`

##Templates

Repeater uses the first "data-repeater-item" as a template for added items.

##Rewritten Name Attributes.

Repeater rewrites your name attributes to avoid collisions within the same form.
(since the name attributes will be repeated).  In the example below, the
name attributes would be renamed `group-a[0][text-input]` and `group-a[1][text-input]`.

Checkbox inputs and Multiple Select inputs will have an additional `[]` appended.  So for example a checkbox
with name `foo` would be mapped to `group-a[0][foo][]`.

Names get reindexed if an item is added or deleted.

##Example

```html
<form class="repeater">
    <!--
        The value given to the data-repeater-list attribute will be used as the
        base of rewritten name attributes.  In this example, the first
        data-repeater-item's name attribute would become group-a[0][text-input],
        and the second data-repeater-item woulc become group-a[1][text-input]
    -->
    <div data-repeater-list="group-a">
      <div data-repeater-item>
        <input type="text" name="text-input" value="A"/>
        <input data-repeater-delete type="button" value="Delete"/>
      </div>
      <div data-repeater-item>
        <input type="text" name="text-input" value="B"/>
        <input data-repeater-delete type="button" value="Delete"/>
      </div>
    </div>
    <input data-repeater-create type="button" value="Add"/>
</form>

<script src="path/to/jquery.js"></script>
<script src="path/to/jquery.repeater/jquery.repeater.js"></script>
<script>
	$(document).ready(function () {
		$('.repeater').repeater({
			// (Optional)
			// "defaultValues" sets the values of added items.  The keys of
            // defaultValues refer to the value of the input's name attribute.
            // If a default value is not specified for an input, then it will
            // have its value cleared.
			defaultValues: {
                'text-input': 'foo'
            },
            // (Optional)
            // "show" is called just after an item is added.  The item is hidden
            // at this point.  If a show callback is not given the item will
            // have $(this).show() called on it.
            show: function () {
                $(this).slideDown();
            },
            // (Optional)
            // "hide" is called when a user clicks on a data-repeater-delete
            // element.  The item is still visible.  "hide" is passed a function
            // as its first argument which will properly remove the item.
            // "hide" allows for a confirmation step, to send a delete request
            // to the server, etc.  If a hide callback is not given the item
            // will be deleted.
            hide: function (deleteElement) {
                if(confirm('Are you sure you want to delete this element?')) {
                    $(this).slideUp(deleteElement);
                }
            },
            // (Optional)
            // You can use this if you need to manually re-index the list
            // for example if you are using a drag and drop library to reorder
            // list items.
            ready: function (setIndexes) {
                $dragAndDrop.on('drop', setIndexes);
            },
            // (Optional)
            // Removes the delete button from the first list item,
            // defaults to false.
            isFirstItemUndeletable: true
		})
	});
</script>
```
