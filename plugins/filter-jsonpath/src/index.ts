import type {PluginDefinition} from '@yaakapp/api';
import {JSONPath} from 'jsonpath-plus';

type AggregateFn = (numbers: number[]) => number;

const AGGREGATE_FUNCTIONS: Record<string, AggregateFn> = {
    sum: (numbers) => numbers.reduce((acc, val) => acc + val, 0),
    min: (numbers) => {
        if (numbers.length === 0) {
            throw new Error('min() requires at least one value')
        }

        return Math.min(...numbers);
    },
    max: (numbers) => {
        if (numbers.length === 0) {
            throw new Error('max() requires at least one value')
        }

        return Math.max(...numbers);
    },
    count: (numbers) => numbers.length,
    avg: (numbers) => {
        if (numbers.length === 0) {
            throw new Error('avg() requires at least one value')
        }

        const sum = numbers.reduce((acc, val) => acc + val, 0);
        return sum / numbers.length;
    },
};

function applyAggregateFunction(data: unknown, fnName: string): number {
    const fn = AGGREGATE_FUNCTIONS[fnName];

    if (!fn) {
        throw new Error(`Unknown aggregate function: ${fnName}()`);
    }

    if (!Array.isArray(data)) {
        throw new Error(`${fnName}() requires an array`);
    }

    const numbers = data.map((item) => {
        const num = typeof item === 'number' ? item : parseFloat(item);
        if (Number.isNaN(num)) {
            throw new Error(`${fnName}() requires numeric values`);
        }

        return num;
    });

    return fn(numbers);
}

export const plugin: PluginDefinition = {
    filter: {
        name: 'JSONPath',
        description: 'Filter JSONPath',
        onFilter(_ctx, args) {
            const parsed = JSON.parse(args.payload);

            try {
                // Check if the filter ends with an aggregate function call like ".sum()" or ".avg()"
                const aggregateMatch = args.filter.match(/\.(\w+)\(\)$/);

                if (aggregateMatch) {
                    const fnName = aggregateMatch[1];
                    const jsonPath = args.filter.slice(0, -aggregateMatch[0].length);

                    if (!jsonPath || !fnName) {
                        return {content: '', error: 'Invalid aggregate function syntax'};
                    }

                    const filtered = JSONPath({path: jsonPath, json: parsed});

                    const result = applyAggregateFunction(filtered, fnName);
                    return {content: JSON.stringify(result, null, 2)};
                }

                const filtered = JSONPath({path: args.filter, json: parsed});
                return {content: JSON.stringify(filtered, null, 2)};
            } catch (err) {
                return {content: '', error: `Invalid filter: ${err}`};
            }
        },
    },
};
