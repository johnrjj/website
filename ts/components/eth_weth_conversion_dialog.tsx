import * as React from 'react';
import * as _ from 'lodash';
import {Dialog, FlatButton, RadioButtonGroup, RadioButton, TextField} from 'material-ui';
import {Side, Token} from 'ts/types';
import {TokenAmountInput} from 'ts/components/inputs/token_amount_input';
import {EthAmountInput} from 'ts/components/inputs/eth_amount_input';
import * as BigNumber from 'bignumber.js';

interface EthWethConversionDialogProps {
    onComplete: (direction: Side, value: BigNumber) => void;
    onCancelled: () => void;
    isOpen: boolean;
    token: Token;
    etherBalance: BigNumber;
}

interface EthWethConversionDialogState {
    value?: BigNumber;
    direction: Side;
    shouldShowIncompleteErrs: boolean;
    hasErrors: boolean;
}

export class EthWethConversionDialog extends
    React.Component<EthWethConversionDialogProps, EthWethConversionDialogState> {
    constructor() {
        super();
        this.state = {
            direction: Side.deposit,
            shouldShowIncompleteErrs: false,
            hasErrors: true,
        };
    }
    public render() {
        const convertDialogActions = [
            <FlatButton
                label="Cancel"
                onTouchTap={this.onCancel.bind(this)}
            />,
            <FlatButton
                label="Convert"
                primary={true}
                onTouchTap={this.onConvertClick.bind(this)}
            />,
        ];
        return (
            <Dialog
                title="I want to convert"
                titleStyle={{fontWeight: 100}}
                actions={convertDialogActions}
                open={this.props.isOpen}>
                {this.renderConversionDialogBody()}
            </Dialog>
        );
    }
    private renderConversionDialogBody() {
        return (
            <div className="mx-auto" style={{maxWidth: 300}}>
                <RadioButtonGroup
                    className="pb1"
                    defaultSelected={this.state.direction}
                    name="conversionDirection"
                    onChange={this.onConversionDirectionChange.bind(this)}
                >
                    <RadioButton
                        className="pb1"
                        value={Side.deposit}
                        label="Ether to wrapped Ether tokens"
                    />
                    <RadioButton
                        value={Side.receive}
                        label="Wrapped Ether tokens to Ether"
                    />
                </RadioButtonGroup>
                {this.state.direction === Side.receive ?
                    <TokenAmountInput
                        label="Amount to convert"
                        token={this.props.token}
                        shouldShowIncompleteErrs={this.state.shouldShowIncompleteErrs}
                        shouldCheckBalance={true}
                        shouldCheckAllowance={false}
                        onChange={this.onValueChange.bind(this)}
                        amount={this.state.value}
                        onVisitBalancesPageClick={this.props.onCancelled}
                    /> :
                    <EthAmountInput
                        label="Amount to convert"
                        balance={this.props.etherBalance}
                        amount={this.state.value}
                        onChange={this.onValueChange.bind(this)}
                        shouldShowIncompleteErrs={this.state.shouldShowIncompleteErrs}
                        onVisitBalancesPageClick={this.props.onCancelled}
                    />
                }
            </div>
        );
    }
    private onConversionDirectionChange(e: any, direction: Side) {
        this.setState({
            value: undefined,
            shouldShowIncompleteErrs: false,
            direction,
            hasErrors: true,
        });
    }
    private onValueChange(isValid: boolean, amount?: BigNumber) {
        this.setState({
            value: amount,
            hasErrors: !isValid,
        });
    }
    private onConvertClick() {
        if (this.state.hasErrors) {
            this.setState({
                shouldShowIncompleteErrs: true,
            });
        } else {
            this.props.onComplete(this.state.direction, this.state.value);
        }
    }
    private onCancel() {
        this.setState({
            value: undefined,
        });
        this.props.onCancelled();
    }
}