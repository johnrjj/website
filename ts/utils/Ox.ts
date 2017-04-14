import * as _ from 'lodash';
import BN = require('bn.js');
import ethUtil = require('ethereumjs-util');

export const Ox = {
    getOrderHash(exchangeContractAddr: string, makerAddr: string, takerAddr: string,
                 depositTokenAddr: string, receiveTokenAddr: string, feeRecipient: string,
                 depositAmt: number, receiveAmt: number, makerFee: string, takerFee: string,
                 expiration: number): string {
        const orderParts = [
            exchangeContractAddr,
            makerAddr,
            takerAddr,
            depositTokenAddr,
            receiveTokenAddr,
            feeRecipient,
            depositAmt,
            receiveAmt,
            makerFee,
            takerFee,
            expiration,
        ];
        const buffHash = this.sha3(orderParts);
        const personalOrderHash = ethUtil.hashPersonalMessage(buffHash);
        const personalOrderHashHex = ethUtil.bufferToHex(personalOrderHash);
        return personalOrderHashHex;
    },
    sha3(params: Array<(string | number | Buffer)>) {
        const messageBuffs = _.map(params, (param) => {
            if (!ethUtil.isHexString(param) && !isNaN(param as number)) {
                return this.numberToBuffer(param);
            }
            if (param === '0x0') {
                return ethUtil.setLength(ethUtil.toBuffer(param), 20);
            }
            return ethUtil.toBuffer(param);
        });
        const hash = ethUtil.sha3(Buffer.concat(messageBuffs));
        return hash;
    },
    numberToBuffer(n: number) {
        const size = 32;
        const endian = 'be';
        return new BN(n.toString()).toArrayLike(Buffer, endian, size);
    },
    isValidOrderHash(orderHash: string): boolean {
        if (_.isString(orderHash) &&
            orderHash.length === 66 &&
            orderHash.substring(0, 2) === '0x') {
            return true;
        }
        return false;
    },
};
