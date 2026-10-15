import { test } from 'node:test';
import assert from 'node:assert/strict';
import {average,checkScreening} from './validate-entry-screenings.mjs';
test('平均成交額使用有效交易日數',()=>assert.equal(average([100,200,300]),200));
test('缺少二十日成交資料不會成為正式入選',()=>{const s={date:'2026-10-14',cutoffAt:'2026-10-13T21:00:00Z',liquidityRule:{minPreviousTurnoverTwd:1e8,minAverage20DayTurnoverTwd:1e8},candidates:[{id:'x',previous:{date:'2026-10-13',closeTwd:100,turnoverTwd:1e8},sourceUrls:['https://www.twse.com.tw'],disposition:'formal-watch',entryBandTwd:{low:95,high:98,discountPctLow:2,discountPctHigh:5}}],qualifiedIds:['x']};assert.ok(checkScreening(s).some(s=>s.includes('二十日成交額')))});
