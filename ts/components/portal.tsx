import * as _ from 'lodash';
import * as React from 'react';
import * as DocumentTitle from 'react-document-title';
import {Switch, Route} from 'react-router-dom';
import {Dispatcher} from 'ts/redux/dispatcher';
import {State} from 'ts/redux/reducer';
import {utils} from 'ts/utils/utils';
import {configs} from 'ts/utils/configs';
import {constants} from 'ts/utils/constants';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import {colors} from 'material-ui/styles';
import {GenerateOrderForm} from 'ts/containers/generate_order_form';
import {Market} from 'ts/containers/market';
import {TokenBalances} from 'ts/components/token_balances';
import {PortalDisclaimerDialog} from 'ts/components/dialogs/portal_disclaimer_dialog';
import {FillOrder} from 'ts/components/fill_order';
import {Blockchain} from 'ts/blockchain';
import {SchemaValidator} from 'ts/schemas/validator';
import {orderSchema} from 'ts/schemas/order_schema';
import {localStorage} from 'ts/local_storage/local_storage';
import {TradeHistory} from 'ts/components/trade_history/trade_history';
import {
    HashData,
    TokenByAddress,
    BlockchainErrs,
    Order,
    Fill,
    Side,
    Styles,
    ScreenWidths,
    Token,
    TokenStateByAddress,
    WebsitePaths,
} from 'ts/types';
import {TopBar} from 'ts/components/top_bar';
import {Footer} from 'ts/components/footer';
import {Loading} from 'ts/components/ui/loading';
import {PortalMenu} from 'ts/components/portal_menu';
import {BlockchainErrDialog} from 'ts/components/dialogs/blockchain_err_dialog';
import * as BigNumber from 'bignumber.js';
import {FlashMessage} from 'ts/components/ui/flash_message';

const THROTTLE_TIMEOUT = 100;

export interface PortalPassedProps {}

export interface PortalAllProps {
    blockchainErr: BlockchainErrs;
    blockchainIsLoaded: boolean;
    dispatcher: Dispatcher;
    hashData: HashData;
    networkId: number;
    nodeVersion: string;
    orderFillAmount: BigNumber.BigNumber;
    screenWidth: ScreenWidths;
    tokenByAddress: TokenByAddress;
    tokenStateByAddress: TokenStateByAddress;
    userEtherBalance: BigNumber.BigNumber;
    userAddress: string;
    shouldBlockchainErrDialogBeOpen: boolean;
    userSuppliedOrderCache: Order;
    location: Location;
    flashMessage?: string|React.ReactNode;
}

interface PortalAllState {
    prevNetworkId: number;
    prevNodeVersion: string;
    prevUserAddress: string;
    hasAcceptedDisclaimer: boolean;
}

const styles: Styles = {
    button: {
        color: 'white',
    },
    headline: {
        fontSize: 20,
        fontWeight: 400,
        marginBottom: 12,
        paddingTop: 16,
    },
    inkBar: {
        background: colors.amber600,
    },
    menuItem: {
        padding: '0px 16px 0px 48px',
    },
    tabItemContainer: {
        background: colors.blueGrey500,
        borderRadius: '4px 4px 0 0',
    },
};

export class Portal extends React.Component<PortalAllProps, PortalAllState> {
    private blockchain: Blockchain;
    private sharedOrderIfExists: Order;
    private throttledScreenWidthUpdate: () => void;
    constructor(props: PortalAllProps) {
        super(props);
        this.sharedOrderIfExists = this.getSharedOrderIfExists();
        this.throttledScreenWidthUpdate = _.throttle(this.updateScreenWidth.bind(this), THROTTLE_TIMEOUT);
        this.state = {
            prevNetworkId: this.props.networkId,
            prevNodeVersion: this.props.nodeVersion,
            prevUserAddress: this.props.userAddress,
            hasAcceptedDisclaimer: false,
        };
    }
    public componentDidMount() {
        window.addEventListener('resize', this.throttledScreenWidthUpdate);
        window.scrollTo(0, 0);
    }
    public componentWillMount() {
        this.blockchain = new Blockchain(this.props.dispatcher);
        const didAcceptPortalDisclaimer = localStorage.getItemIfExists(constants.ACCEPT_DISCLAIMER_LOCAL_STORAGE_KEY);
        const hasAcceptedDisclaimer = !_.isUndefined(didAcceptPortalDisclaimer) &&
                                      !_.isEmpty(didAcceptPortalDisclaimer);
        this.setState({
            hasAcceptedDisclaimer,
        });
    }
    public componentWillUnmount() {
        this.blockchain.destroy();
        window.removeEventListener('resize', this.throttledScreenWidthUpdate);
        // We re-set the entire redux state when the portal is unmounted so that when it is re-rendered
        // the initialization process always occurs from the same base state. This helps avoid
        // initialization inconsistencies (i.e While the portal was unrendered, the user might have
        // become disconnected from their backing Ethereum node, changes user accounts, etc...)
        this.props.dispatcher.resetState();
    }
    public componentWillReceiveProps(nextProps: PortalAllProps) {
        if (nextProps.networkId !== this.state.prevNetworkId) {
            this.blockchain.networkIdUpdatedFireAndForgetAsync(nextProps.networkId);
            this.setState({
                prevNetworkId: nextProps.networkId,
            });
        }
        if (nextProps.userAddress !== this.state.prevUserAddress) {
            this.blockchain.userAddressUpdatedFireAndForgetAsync(nextProps.userAddress);
            if (!_.isEmpty(nextProps.userAddress) &&
                nextProps.blockchainIsLoaded) {
                const tokens = _.values(nextProps.tokenByAddress);
                this.updateBalanceAndAllowanceWithLoadingScreenAsync(tokens);
            }
            this.setState({
                prevUserAddress: nextProps.userAddress,
            });
        }
        if (nextProps.nodeVersion !== this.state.prevNodeVersion) {
            this.blockchain.nodeVersionUpdatedFireAndForgetAsync(nextProps.nodeVersion);
        }
    }
    public render() {
        const updateShouldBlockchainErrDialogBeOpen = this.props.dispatcher
                .updateShouldBlockchainErrDialogBeOpen.bind(this.props.dispatcher);
        const portalStyle: React.CSSProperties = {
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
        };
        return (
            <div style={portalStyle}>
                <DocumentTitle title="0x Portal DApp"/>
                <TopBar
                    userAddress={this.props.userAddress}
                    blockchainIsLoaded={this.props.blockchainIsLoaded}
                    location={this.props.location}
                />
                <div id="portal" className="mx-auto max-width-4 pt4" style={{width: '100%'}}>
                    <Paper className="mb3 mt2">
                        {!configs.isMainnetEnabled && this.props.networkId === constants.MAINNET_NETWORK_ID  ?
                            <div className="p3 center">
                                <div className="h2 py2">Mainnet unavailable</div>
                                <div className="mx-auto pb2 pt2">
                                    <img
                                        src="/images/zrx_token.png"
                                        style={{width: 150}}
                                    />
                                </div>
                                <div>
                                    0x portal is currently unavailable on the Ethereum mainnet.
                                    <div>
                                        To try it out, switch to the Kovan test network
                                        (networkId: 42).
                                    </div>
                                    <div className="py2">
                                        Check back soon!
                                    </div>
                                </div>
                            </div> :
                            <div className="mx-auto flex">
                                <div
                                    className="col col-2 pr2 pt1 sm-hide xs-hide"
                                    style={{overflow: 'hidden', backgroundColor: 'rgb(39, 39, 39)', color: 'white'}}
                                >
                                    <PortalMenu menuItemStyle={{color: 'white'}} />
                                </div>
                                <div className="col col-12 lg-col-10 md-col-10 sm-col sm-col-12">
                                    <div className="py2" style={{backgroundColor: colors.grey50}}>
                                        {this.props.blockchainIsLoaded ?
                                            <Switch>
                                                <Route
                                                    path={`${WebsitePaths.Portal}/fill`}
                                                    render={this.renderFillOrder.bind(this)}
                                                />
                                                <Route
                                                    path={`${WebsitePaths.Portal}/balances`}
                                                    render={this.renderTokenBalances.bind(this)}
                                                />
                                                <Route
                                                    path={`${WebsitePaths.Portal}/trades`}
                                                    component={this.renderTradeHistory.bind(this)}
                                                />
                                                <Route
                                                    path={`${WebsitePaths.Portal}/market`}
                                                    render={this.renderMarket.bind(this)}
                                                />
                                                <Route
                                                    path={`${WebsitePaths.Home}`}
                                                    render={this.renderGenerateOrderForm.bind(this)}
                                                />
                                            </Switch> :
                                            <Loading />
                                        }
                                    </div>
                                </div>
                            </div>
                        }
                    </Paper>
                    <BlockchainErrDialog
                        blockchain={this.blockchain}
                        blockchainErr={this.props.blockchainErr}
                        isOpen={this.props.shouldBlockchainErrDialogBeOpen}
                        userAddress={this.props.userAddress}
                        toggleDialogFn={updateShouldBlockchainErrDialogBeOpen}
                        networkId={this.props.networkId}
                    />
                    <PortalDisclaimerDialog
                        isOpen={!this.state.hasAcceptedDisclaimer}
                        onToggleDialog={this.onPortalDisclaimerAccepted.bind(this)}
                    />
                    <FlashMessage
                        dispatcher={this.props.dispatcher}
                        flashMessage={this.props.flashMessage}
                    />
                </div>
                <Footer location={this.props.location} />
            </div>
        );
    }
    private renderTradeHistory() {
        return (
            <TradeHistory
                tokenByAddress={this.props.tokenByAddress}
                userAddress={this.props.userAddress}
                networkId={this.props.networkId}
            />
        );
    }
    private renderTokenBalances() {
        return (
            <TokenBalances
                blockchain={this.blockchain}
                blockchainErr={this.props.blockchainErr}
                blockchainIsLoaded={this.props.blockchainIsLoaded}
                dispatcher={this.props.dispatcher}
                screenWidth={this.props.screenWidth}
                tokenByAddress={this.props.tokenByAddress}
                tokenStateByAddress={this.props.tokenStateByAddress}
                userAddress={this.props.userAddress}
                userEtherBalance={this.props.userEtherBalance}
                networkId={this.props.networkId}
            />
        );
    }
    private renderFillOrder(match: any, location: Location, history: History) {
        const initialFillOrder = !_.isUndefined(this.props.userSuppliedOrderCache) ?
                                 this.props.userSuppliedOrderCache :
                                 this.sharedOrderIfExists;
        return (
            <FillOrder
                blockchain={this.blockchain}
                blockchainErr={this.props.blockchainErr}
                initialOrder={initialFillOrder}
                isOrderInUrl={!_.isUndefined(this.sharedOrderIfExists)}
                orderFillAmount={this.props.orderFillAmount}
                networkId={this.props.networkId}
                userAddress={this.props.userAddress}
                tokenByAddress={this.props.tokenByAddress}
                tokenStateByAddress={this.props.tokenStateByAddress}
                dispatcher={this.props.dispatcher}
            />
        );
    }
    private renderGenerateOrderForm(match: any, location: Location, history: History) {
        return (
            <GenerateOrderForm
                blockchain={this.blockchain}
                hashData={this.props.hashData}
                dispatcher={this.props.dispatcher}
            />
        );
    }
    private renderMarket(match: any, location: Location, history: History) {
        return (
            <Market
                blockchain={this.blockchain}
                hashData={this.props.hashData}
                dispatcher={this.props.dispatcher}
            />
        );
    }
    private onPortalDisclaimerAccepted() {
        localStorage.setItem(constants.ACCEPT_DISCLAIMER_LOCAL_STORAGE_KEY, 'set');
        this.setState({
            hasAcceptedDisclaimer: true,
        });
    }
    private getSharedOrderIfExists(): Order {
        const queryString = window.location.search;
        if (queryString.length === 0) {
            return;
        }
        const queryParams = queryString.substring(1).split('&');
        const orderQueryParam = _.find(queryParams, queryParam => {
            const queryPair = queryParam.split('=');
            return queryPair[0] === 'order';
        });
        if (_.isUndefined(orderQueryParam)) {
            return;
        }
        const orderPair = orderQueryParam.split('=');
        if (orderPair.length !== 2) {
            return;
        }

        const validator = new SchemaValidator();
        const order = JSON.parse(decodeURIComponent(orderPair[1]));
        const validationResult = validator.validate(order, orderSchema);
        if (validationResult.errors.length > 0) {
            utils.consoleLog(`Invalid shared order: ${validationResult.errors}`);
            return;
        }
        return order;
    }
    private updateScreenWidth() {
        const newScreenWidth = utils.getScreenWidth();
        this.props.dispatcher.updateScreenWidth(newScreenWidth);
    }
    private async updateBalanceAndAllowanceWithLoadingScreenAsync(tokens: Token[]) {
        this.props.dispatcher.updateBlockchainIsLoaded(false);
        await this.blockchain.updateTokenBalancesAndAllowancesAsync(tokens);
        this.props.dispatcher.updateBlockchainIsLoaded(true);
    }
}
