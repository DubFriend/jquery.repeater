#Repeater

Creates an interface to add and remove a repeatable group of input elements.

##Example

```html
<form action="echo.php" class="repeater">
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
  </div>
</form>

<script src="path/to/jquery.js"></script>
<script src="path/to/jquery.repeater/jquery.repeater.js"></script>
<script>
	$(document).ready(function () {
		$('.repeater').repeater({
			// optional
			// Can set added inputs to a default value by the inputs name
			// attribute. If a default value is not specified, then all inputs
			// with name attributes will have their values cleared.
			defaultValues: {
                'textarea-input': 'foo'
            },
            // optional
            // called just after an item is added.  The item is hidden at this
            // point.  If a show callback is not given the item will have $(this).show()
            // called on it.
            show: function () {
                $(this).slideDown();
            },
            // optional
            // Called when a user clicks a delete item button.  This allows
            // for the opportunity for a confirmation step, or to send a delete
            // request to the server, etc.  If a hide callback is not given
            // the item will be deleted.
            hide: function (deleteElement) {
                if(confirm('Are you sure you want to delete this element?')) {
                    $(this).slideUp(deleteElement);
                }
            }
		})
	});
</script>

```
##Templates

Repeater uses the first "data-repeater-item" as a template for added items.

##Rewritten Name Attributes.

Repeater rewrites your name attributes to avoid collisions within the same form.
(since the name attributes will be repeated).  In the example above, the
name attributes would be renamed "group-a[0][text-input]" and "group-a[1][text-input]".

Names get reindexed if an item is added or deleted.