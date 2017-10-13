import * as _ from 'lodash';
import * as React from 'react';
import { ZeroEx } from '0x.js';
import * as BigNumber from 'bignumber.js';
import { Blockchain } from 'ts/blockchain';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ContentRemove from 'material-ui/svg-icons/content/remove';
import {
    Table,
    TableBody,
    TableHeader,
    TableRow,
    TableHeaderColumn,
    TableRowColumn,
} from 'material-ui/Table';
import Dialog from 'material-ui/Dialog';
import { colors } from 'material-ui/styles';
import { constants } from 'ts/utils/constants';
import { Dispatcher } from 'ts/redux/dispatcher';
import { zeroEx } from 'ts/utils/zero_ex';
import { utils } from 'ts/utils/utils';
import { SchemaValidator } from 'ts/schemas/validator';
import { orderSchema } from 'ts/schemas/order_schema';
import { Alert } from 'ts/components/ui/alert';
import { OrderJSON } from 'ts/components/order_json';
import { IdenticonAddressInput } from 'ts/components/inputs/identicon_address_input';
import { TokenInput } from 'ts/components/inputs/token_input';
import { TokenAmountInput } from 'ts/components/inputs/token_amount_input';
import { HashInput } from 'ts/components/inputs/hash_input';
import { ExpirationInput } from 'ts/components/inputs/expiration_input';
import { LifeCycleRaisedButton } from 'ts/components/ui/lifecycle_raised_button';
import { errorReporter } from 'ts/utils/error_reporter';
import { HelpTooltip } from 'ts/components/ui/help_tooltip';
import { SwapIcon } from 'ts/components/ui/swap_icon';
import {
    Side,
    SideToAssetToken,
    SignatureData,
    HashData,
    TokenByAddress,
    TokenStateByAddress,
    BlockchainErrs,
    Order,
    Token,
    AlertTypes,
} from 'ts/types';

import * as openSocket from 'socket.io-client';

enum SigningState {
    UNSIGNED,
    SIGNING,
    SIGNED,
}

interface MarketProps {
    blockchain: Blockchain;
    blockchainErr: BlockchainErrs;
    blockchainIsLoaded: boolean;
    dispatcher: Dispatcher;
    hashData: HashData;
    orderExpiryTimestamp: BigNumber.BigNumber;
    networkId: number;
    userAddress: string;
    orderSignatureData: SignatureData;
    orderTakerAddress: string;
    orderSalt: BigNumber.BigNumber;
    sideToAssetToken: SideToAssetToken;
    tokenByAddress: TokenByAddress;
    tokenStateByAddress: TokenStateByAddress;
}

interface MarketState {
    globalErrMsg: string;
    shouldShowIncompleteErrs: boolean;
    signingState: SigningState;
    isSigning: boolean;
    socket: SocketIOClient.Socket;
}

const style = {
    paper: {
        display: 'inline-block',
        position: 'relative',
        textAlign: 'center',
        width: '100%',
    },
};

const styles = {
    bgColor: {
        backgroundColor: colors.grey50,
    },
};

const TOKEN_TABLE_ROW_HEIGHT = 60;
const MAX_TOKEN_TABLE_HEIGHT = 420;
const TOKEN_COL_SPAN_LG = 2;
const TOKEN_COL_SPAN_SM = 1;

export class Market extends React.Component<MarketProps, MarketState> {
    private validator: SchemaValidator;
    constructor(props: MarketProps) {
        super(props);
        this.state = {
            globalErrMsg: '',
            shouldShowIncompleteErrs: false,
            signingState: SigningState.UNSIGNED,
            isSigning: false,
            socket: null,
        };
        this.validator = new SchemaValidator();
    }
    public componentDidMount() {
        const socket = openSocket('http://localhost:3000');
        socket.on('order', (timestamp: string) => console.log(timestamp));
        this.setState({ socket });

        window.scrollTo(0, 0);
    }
    public componentWillUnmount() {
        const { socket } = this.state;
        if (socket) {
            socket.disconnect();
        }
        window.scrollTo(0, 0);
    }
    public render() {
        const MAX_TOKEN_TABLE_HEIGHT = 420;
        const isTestNetwork = this.props.networkId === constants.TESTNET_NETWORK_ID;

        const TOKEN_TABLE_ROW_HEIGHT = 60;
        const allTokenRowHeight = _.size(this.props.tokenByAddress) * TOKEN_TABLE_ROW_HEIGHT;
        const tokenTableHeight = allTokenRowHeight < MAX_TOKEN_TABLE_HEIGHT
            ? allTokenRowHeight
            : MAX_TOKEN_TABLE_HEIGHT;
        const isSmallScreen = false;//this.props.screenWidth === ScreenWidths.SM;

        const tokenColSpan = isSmallScreen ? TOKEN_COL_SPAN_SM : TOKEN_COL_SPAN_LG;
        const allowanceExplanation = '0x smart contracts require access to your<br> \
        token balances in order to execute trades.<br> \
        Toggling permissions sets an allowance for the<br> \
        smart contract so you can start trading that token.';

        const dispatcher = this.props.dispatcher;
        const depositTokenAddress = this.props.sideToAssetToken[Side.deposit].address;
        const depositToken = this.props.tokenByAddress[depositTokenAddress];
        const depositTokenState = this.props.tokenStateByAddress[depositTokenAddress];
        const receiveTokenAddress = this.props.sideToAssetToken[Side.receive].address;
        const receiveToken = this.props.tokenByAddress[receiveTokenAddress];
        const receiveTokenState = this.props.tokenStateByAddress[receiveTokenAddress];
        const takerExplanation = 'If a taker is specified, only they are<br> \
                                  allowed to fill this order. If no taker is<br> \
                                  specified, anyone is able to fill it.';
        const exchangeContractIfExists = this.props.blockchain.getExchangeContractAddressIfExists();
        return (
            <div className="clearfix mb2 lg-px4 md-px4 sm-px2">
                {/* <div> */}
                <div className="clearfix" style={{ paddingBottom: 1 }}>
                    <div className="col col-11">
                        <h3 className="pt2">
                            {isTestNetwork ? 'Test Orders' : 'Orders'}
                        </h3>
                    </div>
                    <div className="col col-1 align-right">
                        <div style={{ paddingTop: '1.5rem', float: 'right' }}>
                            <FloatingActionButton
                                mini={true}
                                zDepth={0}
                                onClick={(() => { }).bind(this)}
                            >
                                <ContentAdd />
                            </FloatingActionButton>
                        </div>
                    </div>
                </div>
                <Divider />

                <Table
                    selectable={false}
                    bodyStyle={{height: tokenTableHeight}}
                    style={styles.bgColor}
                >
                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                        <TableRow>
                            <TableHeaderColumn
                                colSpan={tokenColSpan}
                            >
                                Token
                            </TableHeaderColumn>
                            <TableHeaderColumn style={{paddingLeft: 3}}>Balance</TableHeaderColumn>
                            <TableHeaderColumn>
                                <div className="inline-block">{!isSmallScreen && 'Trade '}Permissions</div>
                                <HelpTooltip
                                    style={{paddingLeft: 4}}
                                    explanation={allowanceExplanation}
                                />
                            </TableHeaderColumn>
                            <TableHeaderColumn>
                                Action
                            </TableHeaderColumn>
                            {!isSmallScreen &&
                                <TableHeaderColumn>
                                    Send
                                </TableHeaderColumn>
                            }
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false}>
                        {this.renderTokenTableRows()}
                    </TableBody>
                </Table>

                <Divider />

                <div className="mx-auto" style={{ maxWidth: 580 }}>
                    <div className="pt3">
                        <div className="mx-auto clearfix">
                            <div className="lg-col md-col lg-col-5 md-col-5 sm-col sm-col-5 sm-pb2">
                                <TokenInput
                                    userAddress={this.props.userAddress}
                                    blockchain={this.props.blockchain}
                                    blockchainErr={this.props.blockchainErr}
                                    dispatcher={this.props.dispatcher}
                                    label="Selling"
                                    side={Side.deposit}
                                    networkId={this.props.networkId}
                                    assetToken={this.props.sideToAssetToken[Side.deposit]}
                                    updateChosenAssetToken={dispatcher.updateChosenAssetToken.bind(dispatcher)}
                                    tokenByAddress={this.props.tokenByAddress}
                                />
                                <TokenAmountInput
                                    label="Sell amount"
                                    token={depositToken}
                                    tokenState={depositTokenState}
                                    amount={this.props.sideToAssetToken[Side.deposit].amount}
                                    onChange={this.onTokenAmountChange.bind(this, depositToken, Side.deposit)}
                                    shouldShowIncompleteErrs={this.state.shouldShowIncompleteErrs}
                                    shouldCheckBalance={true}
                                    shouldCheckAllowance={true}
                                />
                            </div>
                            <div className="lg-col md-col lg-col-2 md-col-2 sm-col sm-col-2 xs-hide">
                                <div className="p1">
                                    <SwapIcon
                                        swapTokensFn={dispatcher.swapAssetTokenSymbols.bind(dispatcher)}
                                    />
                                </div>
                            </div>
                            <div className="lg-col md-col lg-col-5 md-col-5 sm-col sm-col-5 sm-pb2">
                                <TokenInput
                                    userAddress={this.props.userAddress}
                                    blockchain={this.props.blockchain}
                                    blockchainErr={this.props.blockchainErr}
                                    dispatcher={this.props.dispatcher}
                                    label="Buying"
                                    side={Side.receive}
                                    networkId={this.props.networkId}
                                    assetToken={this.props.sideToAssetToken[Side.receive]}
                                    updateChosenAssetToken={dispatcher.updateChosenAssetToken.bind(dispatcher)}
                                    tokenByAddress={this.props.tokenByAddress}
                                />
                                <TokenAmountInput
                                    label="Receive amount"
                                    token={receiveToken}
                                    tokenState={receiveTokenState}
                                    amount={this.props.sideToAssetToken[Side.receive].amount}
                                    onChange={this.onTokenAmountChange.bind(this, receiveToken, Side.receive)}
                                    shouldShowIncompleteErrs={this.state.shouldShowIncompleteErrs}
                                    shouldCheckBalance={false}
                                    shouldCheckAllowance={false}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="pt1 sm-pb2 lg-px4 md-px4">
                        <div className="lg-px3 md-px3">
                            <div style={{ fontSize: 12, color: colors.grey500 }}>Expiration</div>
                            <ExpirationInput
                                orderExpiryTimestamp={this.props.orderExpiryTimestamp}
                                updateOrderExpiry={dispatcher.updateOrderExpiry.bind(dispatcher)}
                            />
                        </div>
                    </div>
                    <div className="pt1 flex mx-auto">
                        <IdenticonAddressInput
                            label="Taker"
                            initialAddress={this.props.orderTakerAddress}
                            updateOrderAddress={this.updateOrderAddress.bind(this)}
                        />
                        <div className="pt3">
                            <div className="pl1">
                                <HelpTooltip
                                    explanation={takerExplanation}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <HashInput
                            blockchain={this.props.blockchain}
                            blockchainIsLoaded={this.props.blockchainIsLoaded}
                            hashData={this.props.hashData}
                            label="Order Hash"
                        />
                    </div>
                    <div className="pt2">
                        <div className="center">
                            <LifeCycleRaisedButton
                                labelReady="Submit order"
                                labelLoading="Submitting..."
                                labelComplete="Order submitted!"
                                onClickAsyncFn={this.onSignClickedAsync.bind(this)}
                            />
                        </div>
                        {this.state.globalErrMsg !== '' &&
                            <Alert type={AlertTypes.ERROR} message={this.state.globalErrMsg} />
                        }
                    </div>
                </div>
                <Dialog
                    title="Order JSON"
                    titleStyle={{ fontWeight: 100 }}
                    modal={false}
                    open={this.state.signingState === SigningState.SIGNED}
                    onRequestClose={this.onCloseOrderJSONDialog.bind(this)}
                >
                    <OrderJSON
                        exchangeContractIfExists={exchangeContractIfExists}
                        orderExpiryTimestamp={this.props.orderExpiryTimestamp}
                        orderSignatureData={this.props.orderSignatureData}
                        orderTakerAddress={this.props.orderTakerAddress}
                        orderMakerAddress={this.props.userAddress}
                        orderSalt={this.props.orderSalt}
                        orderMakerFee={this.props.hashData.makerFee}
                        orderTakerFee={this.props.hashData.takerFee}
                        orderFeeRecipient={this.props.hashData.feeRecipientAddress}
                        networkId={this.props.networkId}
                        sideToAssetToken={this.props.sideToAssetToken}
                        tokenByAddress={this.props.tokenByAddress}
                    />
                </Dialog>
            </div>
        );
    }

    private renderTokenTableRows() {
        if (!this.props.blockchainIsLoaded || this.props.blockchainErr !== '') {
            return '';
        }
        const isSmallScreen = false;//this.props.screenWidth === ScreenWidths.SM;
        const tokenColSpan = isSmallScreen ? TOKEN_COL_SPAN_SM : TOKEN_COL_SPAN_LG;
        const actionPaddingX = isSmallScreen ? 2 : 24;
        const allTokens = _.values(this.props.tokenByAddress);
        const trackedTokens = _.filter(allTokens, t => t.isTracked);
        const trackedTokensStartingWithEtherToken = trackedTokens;
        const tableRows = _.map(
            trackedTokensStartingWithEtherToken,
            this.renderTokenRow.bind(this, tokenColSpan, actionPaddingX),
        );
        return tableRows;
    }

    private renderTokenRow(tokenColSpan: number, actionPaddingX: number, token: Token) {
        const tokenState = this.props.tokenStateByAddress[token.address];
        this.props.networkId !== constants.MAINNET_NETWORK_ID;
        return (
            <TableRow key={token.address} style={{ height: TOKEN_TABLE_ROW_HEIGHT }}>
                <TableRowColumn
                    colSpan={tokenColSpan}
                >
                    <a href={'#'} target="_blank" style={{ textDecoration: 'none' }}>
                        tokenName
                    </a>
                </TableRowColumn>
                <TableRowColumn style={{ paddingRight: 3, paddingLeft: 3 }}>
                    balance
                </TableRowColumn>
                <TableRowColumn>
                    toggle
                </TableRowColumn>
                <TableRowColumn
                    style={{ paddingLeft: actionPaddingX, paddingRight: actionPaddingX }}
                >
                    <LifeCycleRaisedButton
                        labelReady="Mint"
                        labelLoading={<span style={{ fontSize: 12 }}>Minting...</span>}
                        labelComplete="Minted!"
                        onClickAsyncFn={() => false}
                    />

                </TableRowColumn>
                <TableRowColumn
                    style={{ paddingLeft: actionPaddingX, paddingRight: actionPaddingX }}
                >
                <LifeCycleRaisedButton
                labelReady="Mint"
                labelLoading={<span style={{ fontSize: 12 }}>Minting...</span>}
                labelComplete="Minted!"
                onClickAsyncFn={() => false}
            />                    </TableRowColumn>
            </TableRow>
        );
    }


    private onTokenAmountChange(token: Token, side: Side, isValid: boolean, amount?: BigNumber.BigNumber) {
        this.props.dispatcher.updateChosenAssetToken(side, { address: token.address, amount });
    }
    private onCloseOrderJSONDialog() {
        // Upon closing the order JSON dialog, we update the orderSalt stored in the Redux store
        // with a new value so that if a user signs the identical order again, the newly signed
        // orderHash will not collide with the previously generated orderHash.
        this.props.dispatcher.updateOrderSalt(ZeroEx.generatePseudoRandomSalt());
        this.setState({
            signingState: SigningState.UNSIGNED,
        });
    }
    private async onSignClickedAsync(): Promise<boolean> {
        if (this.props.blockchainErr !== '') {
            this.props.dispatcher.updateShouldBlockchainErrDialogBeOpen(true);
            return null;
        }

        // Check if all required inputs were supplied
        const debitToken = this.props.sideToAssetToken[Side.deposit];
        const debitBalance = this.props.tokenStateByAddress[debitToken.address].balance;
        const debitAllowance = this.props.tokenStateByAddress[debitToken.address].allowance;
        const receiveAmount = this.props.sideToAssetToken[Side.receive].amount;
        if (!_.isUndefined(debitToken.amount) && !_.isUndefined(receiveAmount) &&
            debitToken.amount.gt(0) && receiveAmount.gt(0) &&
            this.props.userAddress !== '' &&
            debitBalance.gte(debitToken.amount) && debitAllowance.gte(debitToken.amount)) {

            try {
                const order = await this.signTransactionAsync();
                if (order) {
                    this.setState({
                        globalErrMsg: '',
                        shouldShowIncompleteErrs: false,
                    });
                    const didPost = await this.postOrder(order);
                }
                return true;
            } catch (e) {
                return false;
            }
        } else {
            let globalErrMsg = 'You must fix the above errors in order to generate a valid order';
            if (this.props.userAddress === '') {
                globalErrMsg = 'You must enable wallet communication';
                this.props.dispatcher.updateShouldBlockchainErrDialogBeOpen(true);
            }
            this.setState({
                globalErrMsg,
                shouldShowIncompleteErrs: true,
            });
            return false;
        }
    }
    private async signTransactionAsync(): Promise<Order> {
        this.setState({
            signingState: SigningState.SIGNING,
        });
        const exchangeContractAddr = this.props.blockchain.getExchangeContractAddressIfExists();
        if (_.isUndefined(exchangeContractAddr)) {
            this.props.dispatcher.updateShouldBlockchainErrDialogBeOpen(true);
            this.setState({
                isSigning: false,
            });
            return null;
        }
        const hashData = this.props.hashData;
        const orderHash = zeroEx.getOrderHash(exchangeContractAddr, hashData.orderMakerAddress,
            hashData.orderTakerAddress, hashData.depositTokenContractAddr,
            hashData.receiveTokenContractAddr, hashData.feeRecipientAddress,
            hashData.depositAmount, hashData.receiveAmount, hashData.makerFee,
            hashData.takerFee, hashData.orderExpiryTimestamp, hashData.orderSalt);

        let globalErrMsg = '';
        let order = null;
        try {
            const signatureData = await this.props.blockchain.signOrderHashAsync(orderHash);
            order = utils.generateOrder(this.props.networkId, exchangeContractAddr, this.props.sideToAssetToken,
                hashData.orderExpiryTimestamp, this.props.orderTakerAddress,
                this.props.userAddress, hashData.makerFee, hashData.takerFee,
                hashData.feeRecipientAddress, signatureData, this.props.tokenByAddress,
                hashData.orderSalt);

            utils.consoleLog(JSON.stringify(order));
            const validationResult = this.validator.validate(order, orderSchema);
            utils.consoleLog(validationResult.toString());
            if (validationResult.errors.length > 0) {
                globalErrMsg = 'Order signing failed. Please refresh and try again';
                utils.consoleLog(`Unexpected error occured: Order validation failed:
                                  ${validationResult.errors}`);
            }
        } catch (err) {
            const errMsg = '' + err;
            if (utils.didUserDenyWeb3Request(errMsg)) {
                globalErrMsg = 'User denied sign request';
            } else {
                globalErrMsg = 'An unexpected error occured. Please try refreshing the page';
                utils.consoleLog(`Unexpected error occured: ${err}`);
                utils.consoleLog(err.stack);
                await errorReporter.reportAsync(err);
            }
        }
        this.setState({
            signingState: globalErrMsg === '' ? SigningState.SIGNED : SigningState.UNSIGNED,
            globalErrMsg,
        });

        if (globalErrMsg === '') {
            return order;
        } else {
            throw new Error();
        }
    }
    private updateOrderAddress(address?: string): void {
        if (!_.isUndefined(address)) {
            this.props.dispatcher.updateOrderTakerAddress(address);
        }
    }

    private async postOrder(order: Order): Promise<boolean> {
        console.log('posting');
        const payload = convertOrderToRelayPayload(order);
        console.log(payload);
        const headers = new Headers();
        headers.set('Content-Type', 'application/json');
        const res = await fetch(endpoint, {
            method: 'post',
            headers,
            body: JSON.stringify(payload),
        });

        const resPayload = await res.json();
        console.log(resPayload);
        return false;
    }
}

const endpoint = 'http://localhost:3000/api/v0/order';

export interface RelayOrderPayloadSignature {
    v: number;
    r: string;
    s: string;
}

export interface RelayOrderPayload {
    maker: string;
    taker?: string;
    makerFee: string;
    takerFee: string;
    makerTokenAmount: string;
    takerTokenAmount: string;
    makerTokenAddress: string;
    takerTokenAddress: string;
    salt: string;
    exchangeContractAddress: string;
    feeRecipient: string;
    expirationUnixTimestampSec: string;
    ecSignature: RelayOrderPayloadSignature;
}

const convertOrderToRelayPayload = (o: Order) => {
    const p: RelayOrderPayload = {
        maker: o.maker.address,
        taker: o.taker.address,
        makerFee: o.maker.feeAmount,
        takerFee: o.taker.feeAmount,
        makerTokenAmount: o.maker.amount,
        takerTokenAmount: o.taker.amount,
        makerTokenAddress: o.maker.token.address,
        takerTokenAddress: o.taker.token.address,
        salt: o.salt,
        feeRecipient: o.feeRecipient,
        exchangeContractAddress: o.exchangeContract,
        expirationUnixTimestampSec: o.expiration,
        ecSignature: {
            v: o.signature.v,
            r: o.signature.r,
            s: o.signature.s,
        },
    };
    return p;
};
