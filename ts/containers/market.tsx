import * as _ from 'lodash';
import * as React from 'react';
import {connect} from 'react-redux';
import {Store as ReduxStore, Dispatch} from 'redux';
import {Dispatcher} from 'ts/redux/dispatcher';
import {State} from 'ts/redux/reducer';
import {Blockchain} from 'ts/blockchain';
import {Market as MarketComponent} from 'ts/components/market/market';
import {
    SideToAssetToken,
    SignatureData,
    HashData,
    TokenByAddress,
    TokenStateByAddress,
    BlockchainErrs,
} from 'ts/types';
import * as BigNumber from 'bignumber.js';

interface MarketProps {
    blockchain: Blockchain;
    hashData: HashData;
    dispatcher: Dispatcher;
}

interface ConnectedState {
    blockchainErr: BlockchainErrs;
    blockchainIsLoaded: boolean;
    orderExpiryTimestamp: BigNumber.BigNumber;
    orderSignatureData: SignatureData;
    userAddress: string;
    orderTakerAddress: string;
    orderSalt: BigNumber.BigNumber;
    networkId: number;
    sideToAssetToken: SideToAssetToken;
    tokenByAddress: TokenByAddress;
    tokenStateByAddress: TokenStateByAddress;
}

const mapStateToProps = (state: State, ownProps: MarketProps): ConnectedState => ({
    blockchainErr: state.blockchainErr,
    blockchainIsLoaded: state.blockchainIsLoaded,
    orderExpiryTimestamp: state.orderExpiryTimestamp,
    orderSignatureData: state.orderSignatureData,
    orderTakerAddress: state.orderTakerAddress,
    orderSalt: state.orderSalt,
    networkId: state.networkId,
    sideToAssetToken: state.sideToAssetToken,
    tokenByAddress: state.tokenByAddress,
    tokenStateByAddress: state.tokenStateByAddress,
    userAddress: state.userAddress,
});

export const Market: React.ComponentClass<MarketProps> =
  connect(mapStateToProps)(MarketComponent);
