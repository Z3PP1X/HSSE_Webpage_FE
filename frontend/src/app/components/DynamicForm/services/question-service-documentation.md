# QuestionService Documentation

## formGroups Function

### Purpose
The `formGroups` function in the QuestionService class is responsible for processing and organizing form elements into a hierarchical structure with categories. It constructs the organizational framework that allows complex dynamic forms to be rendered with proper categorization.

### Function Signature
```typescript
formGroups(
  data: FormGroupBase<any>[] | QuestionBase<any>[],
  groupKey?: string,
  groupTitle?: string
): void
```

### Parameters
- `data`: An array of form groups or questions to process
- `groupKey` (optional): Key identifier for the current group context
- `groupTitle` (optional): Title for the current group context

### Core Functionality

#### Category Management
The function maintains internal state to track categories:
- `categorySet`: Boolean flag indicating if a category has been established in the current context
- `currentCategoryKey`: Reference to the most recently processed category key

#### Element Processing Logic
For each element in the provided `data` array:

1. **Type Determination**:
   - The function uses `isFormGroup()` to check if the element is a form group or a question

2. **Form Group Processing**:
   - If the element is a form group AND has `isCategory` set to true AND no category has been set yet:
     - It calls `formCategories()` with the element's key as a new category
     - Sets `categorySet` to true
     - Updates `currentCategoryKey`

   - If the element is a form group AND has `isCategory` set to true AND a category has already been set:
     - It calls `formCategories()` to relate the current category to this new one
     - Updates `currentCategoryKey`

   - If the element is a form group BUT is not a category:
     - It calls `formCategories()` to add this element to the current category

   - For all form groups, the function recursively calls itself with `element.fields` to process nested elements

3. **Question Processing**:
   - If the element is a question (not a form group), it calls `formQuetions()` to process it

### Recursive Nature
The function builds a complete tree structure by recursively processing nested form groups. This allows for arbitrarily deep nesting of form elements within groups and categories.

### Data Structures Populated
- `categories`: Array containing category keys
- Logic in `formCategories()` may populate additional data structures

### Related Functions
- `formCategories()`: Manages relationships between categories and elements
- `isFormGroup()`: Type guard to differentiate between form groups and questions
- `formQuetions()`: Processes individual question elements

### Usage Example
```typescript
// Initialize a question service
const questionService = new QuestionService();

// Process a form structure
questionService.formGroups(formDefinition);

// The categories and related structures are now populated
// and can be used to render the form with proper organization
```

## Notes
- The function focuses on structure organization rather than rendering
- Empty or incomplete implementation of `formCategories()` may limit functionality
- The current implementation subscribes to the observable returned by `formQuetions()` but doesn't use the result
