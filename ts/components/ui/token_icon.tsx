import * as React from 'react';
import {Token} from 'ts/types';
import {Identicon} from 'ts/components/ui/identicon';

interface TokenIconProps {
    token: Token;
    diameter: number;
}

interface TokenIconState {}

export class TokenIcon extends React.Component<TokenIconProps, TokenIconState> {
    public render() {
        return (
            <div>
                {(this.props.token.isRegistered) ?
                    <img
                        style={{width: this.props.diameter, height: this.props.diameter}}
                        src={this.props.token.iconUrl}
                    /> :
                    <Identicon address={this.props.token.address} diameter={this.props.diameter} />
                }
            </div>
        );
    }
}
