import {describe, expect, test} from 'vitest';
import {plugin} from '../src';
import type {Context, FilterResponse} from '@yaakapp/api';

describe('filter-jsonpath aggregate functions', () => {
    const mockCtx = {} as Context;

    test('sum() calculates total of numeric array', () => {
        const payload = JSON.stringify({prices: [10, 20, 30, 40]});

        const result = plugin.filter?.onFilter(mockCtx, {
            payload,
            filter: '$.prices.*.sum()',
            mimeType: 'application/json'
        }) as FilterResponse;

        expect(result).toEqual({content: JSON.stringify(100, null, 2)});
    });

    test('sum() returns 0 for empty array', () => {
        const payload = JSON.stringify({prices: []});

        const result = plugin.filter?.onFilter(mockCtx, {
            payload,
            filter: '$.prices.*.sum()',
            mimeType: 'application/json'
        }) as FilterResponse;

        expect(result).toEqual({content: JSON.stringify(0, null, 2)});
    });

    test('min() returns minimum value', () => {
        const payload = JSON.stringify({scores: [85, 92, 78, 95, 88]});

        const result = plugin.filter?.onFilter(mockCtx, {
            payload,
            filter: '$.scores.*.min()',
            mimeType: 'application/json'
        }) as FilterResponse;

        expect(result).toEqual({content: JSON.stringify(78, null, 2)});
    });

    test('min() throws error for empty array', () => {
        const payload = JSON.stringify({scores: []});

        const result = plugin.filter?.onFilter(mockCtx, {
            payload,
            filter: '$.scores.*.min()',
            mimeType: 'application/json'
        }) as FilterResponse;

        expect(result.error).toContain('min() requires at least one value');
    });

    test('max() returns maximum value', () => {
        const payload = JSON.stringify({scores: [85, 92, 78, 95, 88]});

        const result = plugin.filter?.onFilter(mockCtx, {
            payload,
            filter: '$.scores.*.max()',
            mimeType: 'application/json'
        }) as FilterResponse;

        expect(result).toEqual({content: JSON.stringify(95, null, 2)});
    });

    test('max() throws error for empty array', () => {
        const payload = JSON.stringify({scores: []});

        const result = plugin.filter?.onFilter(mockCtx, {
            payload,
            filter: '$.scores.*.max()',
            mimeType: 'application/json'
        }) as FilterResponse;

        expect(result.error).toContain('max() requires at least one value');
    });

    test('count() returns array length', () => {
        const payload = JSON.stringify({items: [1, 2, 3, 4, 5]});

        const result = plugin.filter?.onFilter(mockCtx, {
            payload,
            filter: '$.items.*.count()',
            mimeType: 'application/json'
        }) as FilterResponse;

        expect(result).toEqual({content: JSON.stringify(5, null, 2)});
    });

    test('count() returns 0 for empty array', () => {
        const payload = JSON.stringify({items: []});

        const result = plugin.filter?.onFilter(mockCtx, {
            payload,
            filter: '$.items.*.count()',
            mimeType: 'application/json'
        }) as FilterResponse;

        expect(result).toEqual({content: JSON.stringify(0, null, 2)});
    });

    test('avg() calculates average', () => {
        const payload = JSON.stringify({grades: [80, 90, 100]});

        const result = plugin.filter?.onFilter(mockCtx, {
            payload,
            filter: '$.grades.*.avg()',
            mimeType: 'application/json'
        }) as FilterResponse;

        expect(result).toEqual({content: JSON.stringify(90, null, 2)});
    });

    test('avg() throws error for empty array', () => {
        const payload = JSON.stringify({grades: []});

        const result = plugin.filter?.onFilter(mockCtx, {
            payload,
            filter: '$.grades.*.avg()',
            mimeType: 'application/json'
        }) as FilterResponse;

        expect(result.error).toContain('avg() requires at least one value');
    });

    test('aggregate functions work with nested JSONPath', () => {
        const payload = JSON.stringify({
            products: [
                {name: 'Product A', price: 10},
                {name: 'Product B', price: 20},
                {name: 'Product C', price: 30},
            ],
        });

        const result = plugin.filter?.onFilter(mockCtx, {
            payload,
            filter: '$.products[*].price.sum()',
            mimeType: 'application/json',
        }) as FilterResponse;

        expect(result).toEqual({content: JSON.stringify(60, null, 2)});
    });

    test('aggregate functions handle string numbers', () => {
        const payload = JSON.stringify({values: ['10', '20', '30']});

        const result = plugin.filter?.onFilter(mockCtx, {
            payload,
            filter: '$.values.*.sum()',
            mimeType: 'application/json'
        }) as FilterResponse;

        expect(result).toEqual({content: JSON.stringify(60, null, 2)});
    });

    test('throws error for non-numeric values', () => {
        const payload = JSON.stringify({items: ['a', 'b', 'c']});

        const result = plugin.filter?.onFilter(mockCtx, {
            payload,
            filter: '$.items.sum()',
            mimeType: 'application/json'
        }) as FilterResponse;

        expect(result.error).toContain('sum() requires numeric values');
    });

    test('aggregate functions work with single values', () => {
        const payload = JSON.stringify({value: 42});

        const result = plugin.filter?.onFilter(mockCtx, {
            payload,
            filter: '$.value.sum()',
            mimeType: 'application/json'
        }) as FilterResponse;

        expect(result).toEqual({content: JSON.stringify(42, null, 2)});
    });

    test('throws error for unknown aggregate function', () => {
        const payload = JSON.stringify({items: [1, 2, 3]});

        const result = plugin.filter?.onFilter(mockCtx, {
            payload,
            filter: '$.items.median()',
            mimeType: 'application/json'
        }) as FilterResponse;

        expect(result.error).toContain('Unknown aggregate function: median()');
    });

    test('standard JSONPath still works without aggregate functions', () => {
        const payload = JSON.stringify({user: {name: 'John', age: 30}});

        const result = plugin.filter?.onFilter(mockCtx, {
            payload,
            filter: '$.user.name',
            mimeType: 'application/json'
        }) as FilterResponse;

        expect(result).toEqual({content: JSON.stringify(['John'], null, 2)});
    });

    test('aggregate functions work with floating point numbers', () => {
        const payload = JSON.stringify({values: [1.5, 2.5, 3.0]});

        const result = plugin.filter?.onFilter(mockCtx, {
            payload,
            filter: '$.values.*.avg()',
            mimeType: 'application/json'
        }) as FilterResponse;

        expect(result).toEqual({content: JSON.stringify(2.3333333333333335, null, 2)});
    });

    test('sum() works with negative numbers', () => {
        const payload = JSON.stringify({values: [-10, 20, -5, 15]});

        const result = plugin.filter?.onFilter(mockCtx, {
            payload,
            filter: '$.values.*.sum()',
            mimeType: 'application/json'
        }) as FilterResponse;

        expect(result).toEqual({content: JSON.stringify(20, null, 2)});
    });

    test('min() works with negative numbers', () => {
        const payload = JSON.stringify({values: [10, -20, 5, -15]});

        const result = plugin.filter?.onFilter(mockCtx, {
            payload,
            filter: '$.values.*.min()',
            mimeType: 'application/json'
        }) as FilterResponse;

        expect(result).toEqual({content: JSON.stringify(-20, null, 2)});
    });

    test('max() works with negative numbers', () => {
        const payload = JSON.stringify({values: [-10, -20, -5, -15]});

        const result = plugin.filter?.onFilter(mockCtx, {
            payload,
            filter: '$.values.*.max()',
            mimeType: 'application/json'
        }) as FilterResponse;

        expect(result).toEqual({content: JSON.stringify(-5, null, 2)});
    });
});
