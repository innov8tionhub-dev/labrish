# Story Prompt Generator - Enhanced Debugging

## Problem
Getting error: "No valid prompts in response. Please try again."

Even though OpenAI is returning valid JSON with the correct structure.

## OpenAI Response Structure (Confirmed Valid)
```json
[
  {
    "title": "The Rainmaker of Little Blue Hole",
    "prompt": "In a seaside village...",
    "category": "Folklore"
  },
  {
    "title": "The Caymanian Carib Cat...",
    "prompt": "On Cayman's riverbanks...",
    "category": "Folklore"
  },
  {
    "title": "The Island Tin Drum...",
    "prompt": "In Kingston's Waterhouse...",
    "category": "Folklore"
  }
]
```

## Enhanced Debugging Added

### New Console Logs
The component now logs:

1. **Full Response Object**
   ```js
   console.log('Full Response:', response);
   ```

2. **Response Output**
   ```js
   console.log('Response Output:', response.output);
   console.log('Output Type:', typeof response.output);
   ```

3. **Array Detection**
   ```js
   if (Array.isArray(response.output)) {
     console.log('Output is already an array');
   }
   ```

4. **Individual Prompt Validation**
   ```js
   console.log(`Checking prompt ${index}:`, {
     hasTitle: !!p?.title,
     hasPrompt: !!p?.prompt,
     hasCategory: !!p?.category,
     titleType: typeof p?.title,
     promptType: typeof p?.prompt,
     categoryType: typeof p?.category,
   });
   ```

## How to Debug

### Step 1: Open Browser Console
- Chrome/Edge: F12 or Cmd+Option+I (Mac)
- Firefox: F12 or Cmd+Option+K (Mac)
- Safari: Cmd+Option+C (Mac)

### Step 2: Navigate to Text-to-Speech Page

### Step 3: Click "Folklore" then Check Logs

Look for these key logs in order:

1. **"Full Response:"**
   - Shows entire API response object
   - Check if `success: true`
   - Check structure of `output`

2. **"Response Output:"**
   - Shows what's in `response.output`
   - Could be string or array

3. **"Output Type:"**
   - Should be either "string" or "object"

4. **"Output is already an array"** OR **"AI Response Output Text:"**
   - If array: data is already parsed
   - If text: needs JSON extraction

5. **"Parsed Prompts:"**
   - Shows array after parsing
   - Should contain 3 objects

6. **"Number of prompts:"**
   - Should be `3`

7. **"Checking prompt 0:"**, **"Checking prompt 1:"**, **"Checking prompt 2:"**
   - Shows validation details for each prompt
   - All should have `hasTitle: true`, `hasPrompt: true`, `hasCategory: true`
   - All types should be `"string"`

8. **"Valid Prompts Count:"**
   - Should be `3`

9. **"Valid Prompts:"**
   - Final array that will be rendered

## Possible Issues

### Issue 1: Response Format Different
**Symptom:** "Output Type:" shows unexpected type

**Check:**
- Is `response.output` a string with JSON?
- Is `response.output` already an array?
- Is `response.output` something else?

**Solution:** Adjust parsing based on actual format

### Issue 2: Nested Response
**Symptom:** response.output contains nested structure

**Example:**
```js
{
  output: {
    data: [...prompts...]
  }
}
```

**Solution:** Adjust path to access prompts

### Issue 3: Field Names Different
**Symptom:** "Checking prompt X:" shows `hasTitle: false` etc.

**Check:** What ARE the actual field names?

**Solution:** Update validation to match actual field names

### Issue 4: Extra Wrapper
**Symptom:** Prompts are wrapped in another object

**Example:**
```js
{
  prompts: [
    { title: ..., prompt: ..., category: ... }
  ]
}
```

**Solution:** Extract from wrapper first

## Expected Flow

### Normal Success Path:
1. ✅ API returns JSON array
2. ✅ Parse JSON successfully
3. ✅ All 3 prompts have required fields
4. ✅ All fields are strings
5. ✅ Valid count = 3
6. ✅ Prompts render on screen

### Current Flow (Failing):
1. ✅ API returns JSON array (confirmed from OpenAI logs)
2. ✅ Parse JSON successfully (?)
3. ❌ **Some/all prompts fail validation**
4. ❌ Valid count = 0
5. ❌ Error: "No valid prompts in response"

## Next Steps

1. **Run the test** - Click Folklore button
2. **Copy ALL console logs** - From "Full Response:" through "Valid Prompts:"
3. **Share the logs** - So we can see exact data structure
4. **Compare** - We'll see why validation is failing

## Changes Made

**File:** `/src/components/ai/StoryPromptGenerator.tsx`

### 1. Handle Array or String Response
```tsx
// If output is already an array, use it directly
if (Array.isArray(response.output)) {
  console.log('Output is already an array');
  parsedPrompts = response.output;
} else {
  // Otherwise, try to extract JSON from string
  const outputText = typeof response.output === 'string' ? response.output : JSON.stringify(response.output);
  const jsonMatch = outputText.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    parsedPrompts = JSON.parse(jsonMatch[0]);
  } else {
    throw new Error('Invalid response format. Please try again.');
  }
}
```

### 2. Detailed Validation Logging
```tsx
const validPrompts = parsedPrompts.filter((p: any, index: number) => {
  console.log(`Checking prompt ${index}:`, {
    hasTitle: !!p?.title,
    hasPrompt: !!p?.prompt,
    hasCategory: !!p?.category,
    titleType: typeof p?.title,
    promptType: typeof p?.prompt,
    categoryType: typeof p?.category,
  });

  const isValid = p &&
                 typeof p === 'object' &&
                 p.title &&
                 typeof p.title === 'string' &&
                 p.prompt &&
                 typeof p.prompt === 'string' &&
                 p.category &&
                 typeof p.category === 'string';

  if (!isValid) {
    console.warn('Invalid prompt structure:', p);
  }
  return isValid;
});
```

### 3. Count Logging
```tsx
console.log('Valid Prompts Count:', validPrompts.length);
console.log('Valid Prompts:', validPrompts);
```

## Build Status

```
✓ 1979 modules transformed
✓ built in 6.97s
✅ ZERO errors
```

## Summary

The component now has **comprehensive logging** at every step to help identify exactly where and why the validation is failing. Once you run the test and share the console logs, we'll be able to pinpoint the exact issue and fix it immediately.

The OpenAI response structure looks perfect, so the issue is likely in how it's being passed through the Edge Function or how we're accessing the fields.
