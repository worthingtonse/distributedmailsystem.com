#!/usr/bin/env node
// Fills the locker-key pools up to target depths by minting through the
// Core API. Safe to re-run: it only mints the shortfall.
//
//   node mint-pools.js                          # default targets
//   node mint-pools.js bit=20 giga=2 bonus=10   # override any pool
//   node mint-pools.js --dry-run                # show shortfall, mint nothing
//
// Every coin comes out of the funding wallet (FUNDING_WALLET_PATH env or
// /opt/raidax/Client_Data/Wallets/Default), so mind the giga target: each
// giga key locks up a 10,000 CC coin.

require('dotenv').config();
const fulfillment = require('./fulfillment');

const DEFAULT_TARGETS = { bit: 20, byte: 20, kilo: 10, mega: 5, giga: 2, bonus: 25 };

async function main() {
    const targets = { ...DEFAULT_TARGETS };
    let dryRun = false;

    for (const arg of process.argv.slice(2)) {
        if (arg === '--dry-run') { dryRun = true; continue; }
        const m = /^(bit|byte|kilo|mega|giga|bonus)=(\d+)$/.exec(arg);
        if (!m) {
            console.error(`Unrecognized argument: ${arg}`);
            console.error('Usage: node mint-pools.js [--dry-run] [bit=N byte=N kilo=N mega=N giga=N bonus=N]');
            process.exit(1);
        }
        targets[m[1]] = parseInt(m[2], 10);
    }

    fulfillment.init({});
    const counts = fulfillment.stockCounts();

    console.log(`Funding wallet: ${fulfillment.FUNDING_WALLET}`);
    const balance = await fulfillment.checkFundingWalletBalance();
    if (balance != null) console.log(`Wallet balance: ${balance} CC`);

    let plannedCost = 0;
    const plan = [];
    for (const [pool, target] of Object.entries(targets)) {
        const have = counts[pool] || 0;
        const need = Math.max(0, target - have);
        if (need > 0) {
            const costEach = pool === 'bonus'
                ? fulfillment.BONUS_COIN_AMOUNT
                : fulfillment.CLASSES[pool].denomination;
            plannedCost += need * costEach;
            plan.push({ pool, have, target, need });
        }
        console.log(`  ${pool}: have ${have}, target ${target}, minting ${need}`);
    }

    if (plan.length === 0) {
        console.log('All pools are at target. Nothing to mint.');
        return;
    }
    console.log(`Total coins to lock up: ${plannedCost} CC`);

    if (balance != null && balance < plannedCost) {
        console.error(`ABORT: wallet holds ${balance} CC but the plan needs ${plannedCost} CC.`);
        process.exit(1);
    }
    if (dryRun) {
        console.log('Dry run - no coins minted.');
        return;
    }

    for (const { pool, need } of plan) {
        console.log(`\nMinting ${need} ${pool} key(s)...`);
        if (pool === 'bonus') await fulfillment.replenishBonusPool(need);
        else await fulfillment.replenishPool(pool, need);
    }

    console.log('\nFinal pool counts:', fulfillment.stockCounts());
}

main().catch(err => {
    console.error('mint-pools failed:', err.message);
    process.exit(1);
});
