import * as _ from 'lodash';
import * as React from 'react';
import {colors} from 'material-ui/styles';
import Dialog from 'material-ui/Dialog';
import GridList from 'material-ui/GridList/GridList';
import GridTile from 'material-ui/GridList/GridTile';
import FlatButton from 'material-ui/FlatButton';
import {utils} from 'ts/utils/utils';
import {Blockchain} from 'ts/blockchain';
import {Dispatcher} from 'ts/redux/dispatcher';
import {
    Token,
    AssetToken,
    TokenByAddress,
    Styles,
    TokenState,
    DialogConfigs,
    TokenVisibility,
} from 'ts/types';
import {NewTokenForm} from 'ts/components/generate_order/new_token_form';
import {trackedTokenStorage} from 'ts/local_storage/tracked_token_storage';
import {TrackTokenConfirmation} from 'ts/components/track_token_confirmation';
import {TokenIcon} from 'ts/components/ui/token_icon';

const TOKEN_ICON_DIMENSION = 100;
const TILE_DIMENSION = 146;
enum AssetViews {
    ASSET_PICKER = 'ASSET_PICKER',
    NEW_TOKEN_FORM = 'NEW_TOKEN_FORM',
    CONFIRM_TRACK_TOKEN = 'CONFIRM_TRACK_TOKEN',
}

interface AssetPickerProps {
    userAddress: string;
    blockchain: Blockchain;
    dispatcher: Dispatcher;
    networkId: number;
    isOpen: boolean;
    currentTokenAddress: string;
    onTokenChosen: (tokenAddress: string) => void;
    tokenByAddress: TokenByAddress;
    tokenVisibility?: TokenVisibility;
}

interface AssetPickerState {
    assetView: AssetViews;
    hoveredAddress: string | undefined;
    chosenTrackTokenAddress: string;
    isAddingTokenToTracked: boolean;
}

export class AssetPicker extends React.Component<AssetPickerProps, AssetPickerState> {
    public static defaultProps: Partial<AssetPickerProps> = {
        tokenVisibility: TokenVisibility.ALL,
    };
    private dialogConfigsByAssetView: {[assetView: string]: DialogConfigs};
    constructor(props: AssetPickerProps) {
        super(props);
        this.state = {
            assetView: AssetViews.ASSET_PICKER,
            hoveredAddress: undefined,
            chosenTrackTokenAddress: undefined,
            isAddingTokenToTracked: false,
        };
        this.dialogConfigsByAssetView = {
            [AssetViews.ASSET_PICKER]: {
                title: 'Select token',
                isModal: false,
                actions: [],
            },
            [AssetViews.NEW_TOKEN_FORM]: {
                title: 'Add an ERC20 token',
                isModal: false,
                actions: [],
            },
            [AssetViews.CONFIRM_TRACK_TOKEN]: {
                title: 'Tracking confirmation',
                isModal: true,
                actions: [
                    <FlatButton
                        label="No"
                        onTouchTap={this.onTrackConfirmationRespondedAsync.bind(this, false)}
                    />,
                    <FlatButton
                        label="Yes"
                        onTouchTap={this.onTrackConfirmationRespondedAsync.bind(this, true)}
                    />,
                ],
            },
        };
    }
    public render() {
        const dialogConfigs: DialogConfigs = this.dialogConfigsByAssetView[this.state.assetView];
        return (
            <Dialog
                title={dialogConfigs.title}
                titleStyle={{fontWeight: 100}}
                modal={dialogConfigs.isModal}
                open={this.props.isOpen}
                actions={dialogConfigs.actions}
                onRequestClose={this.onCloseDialog.bind(this)}
            >
                {this.state.assetView === AssetViews.ASSET_PICKER &&
                    this.renderAssetPicker()
                }
                {this.state.assetView === AssetViews.NEW_TOKEN_FORM &&
                    <NewTokenForm
                        blockchain={this.props.blockchain}
                        onNewTokenSubmitted={this.onNewTokenSubmitted.bind(this)}
                        tokenByAddress={this.props.tokenByAddress}
                    />
                }
                {this.state.assetView === AssetViews.CONFIRM_TRACK_TOKEN &&
                    this.renderConfirmTrackToken()
                }
            </Dialog>
        );
    }
    private renderConfirmTrackToken() {
        const token = this.props.tokenByAddress[this.state.chosenTrackTokenAddress];
        return (
            <TrackTokenConfirmation
                tokens={[token]}
                tokenByAddress={this.props.tokenByAddress}
                networkId={this.props.networkId}
                isAddingTokenToTracked={this.state.isAddingTokenToTracked}
            />
        );
    }
    private renderAssetPicker() {
        return (
            <div
                className="clearfix flex flex-wrap"
                style={{overflowY: 'auto', maxWidth: 720, maxHeight: 356, marginBottom: 10}}
            >
                {this.renderGridTiles()}
            </div>
        );
    }
    private renderGridTiles() {
        const gridTiles = _.map(this.props.tokenByAddress, (token: Token, address: string) => {
            if ((this.props.tokenVisibility === TokenVisibility.TRACKED && !token.isTracked) ||
                (this.props.tokenVisibility === TokenVisibility.UNTRACKED && token.isTracked)) {
                return null; // Skip
            }
            const isHovered = this.state.hoveredAddress === address;
            const tileStyles = {
                cursor: 'pointer',
                opacity: isHovered ? 0.6 : 1,
            };
            return (
                <div
                    key={address}
                    style={{width: TILE_DIMENSION, height: TILE_DIMENSION, ...tileStyles}}
                    className="p2 mx-auto"
                    onClick={this.onChooseToken.bind(this, address)}
                    onMouseEnter={this.onToggleHover.bind(this, address, true)}
                    onMouseLeave={this.onToggleHover.bind(this, address, false)}
                >
                    <div className="p1 center">
                        <TokenIcon token={token} diameter={TOKEN_ICON_DIMENSION} />
                    </div>
                    <div className="center">{token.name}</div>
                </div>
            );
        });
        const otherTokenKey = 'otherToken';
        const isHovered = this.state.hoveredAddress === otherTokenKey;
        const tileStyles = {
            cursor: 'pointer',
            opacity: isHovered ? 0.6 : 1,
        };
        if (this.props.tokenVisibility !== TokenVisibility.TRACKED) {
            gridTiles.push((
                <div
                    key={otherTokenKey}
                    style={{width: TILE_DIMENSION, height: TILE_DIMENSION, ...tileStyles}}
                    className="p2 mx-auto"
                    onClick={this.onCustomAssetChosen.bind(this)}
                    onMouseEnter={this.onToggleHover.bind(this, otherTokenKey, true)}
                    onMouseLeave={this.onToggleHover.bind(this, otherTokenKey, false)}
                >
                    <div className="p1 center">
                        <i
                            style={{fontSize: 105, paddingLeft: 1, paddingRight: 1}}
                            className="zmdi zmdi-plus-circle"
                        />
                    </div>
                    <div className="center">Other ERC20 Token</div>
                </div>
            ));
        }
        return gridTiles;
    }
    private onToggleHover(address: string, isHovered: boolean) {
        const hoveredAddress = isHovered ? address : undefined;
        this.setState({
            hoveredAddress,
        });
    }
    private onCloseDialog() {
        this.setState({
            assetView: AssetViews.ASSET_PICKER,
        });
        this.props.onTokenChosen(this.props.currentTokenAddress);
    }
    private onChooseToken(tokenAddress: string) {
        const token = this.props.tokenByAddress[tokenAddress];
        if (token.isTracked) {
            this.props.onTokenChosen(tokenAddress);
        } else {
            this.setState({
                assetView: AssetViews.CONFIRM_TRACK_TOKEN,
                chosenTrackTokenAddress: tokenAddress,
            });
        }
    }
    private getTitle() {
        switch (this.state.assetView) {
            case AssetViews.ASSET_PICKER:
                return 'Select token';

            case AssetViews.NEW_TOKEN_FORM:
                return 'Add an ERC20 token';

            case AssetViews.CONFIRM_TRACK_TOKEN:
                return 'Tracking confirmation';

            default:
                throw utils.spawnSwitchErr('assetView', this.state.assetView);
        }
    }
    private onCustomAssetChosen() {
        this.setState({
            assetView: AssetViews.NEW_TOKEN_FORM,
        });
    }
    private onNewTokenSubmitted(newToken: Token, newTokenState: TokenState) {
        this.props.dispatcher.updateTokenStateByAddress({
            [newToken.address]: newTokenState,
        });
        trackedTokenStorage.addTrackedTokenToUser(this.props.userAddress, this.props.networkId, newToken);
        this.props.dispatcher.addTokenToTokenByAddress(newToken);
        this.setState({
            assetView: AssetViews.ASSET_PICKER,
        });
        this.props.onTokenChosen(newToken.address);
    }
    private async onTrackConfirmationRespondedAsync(didUserAcceptTracking: boolean) {
        if (!didUserAcceptTracking) {
            this.setState({
                isAddingTokenToTracked: false,
                assetView: AssetViews.ASSET_PICKER,
                chosenTrackTokenAddress: undefined,
            });
            this.onCloseDialog();
            return;
        }
        this.setState({
            isAddingTokenToTracked: true,
        });
        const tokenAddress = this.state.chosenTrackTokenAddress;
        const token = this.props.tokenByAddress[tokenAddress];
        const newTokenEntry = _.assign({}, token);

        newTokenEntry.isTracked = true;
        trackedTokenStorage.addTrackedTokenToUser(this.props.userAddress, this.props.networkId, newTokenEntry);
        this.props.dispatcher.updateTokenByAddress([newTokenEntry]);

        const [
            balance,
            allowance,
        ] = await this.props.blockchain.getCurrentUserTokenBalanceAndAllowanceAsync(token.address);
        this.props.dispatcher.updateTokenStateByAddress({
            [token.address]: {
                balance,
                allowance,
            },
        });
        this.setState({
            isAddingTokenToTracked: false,
            assetView: AssetViews.ASSET_PICKER,
            chosenTrackTokenAddress: undefined,
        });
        this.props.onTokenChosen(tokenAddress);
    }
}
