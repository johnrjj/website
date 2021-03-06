import * as _ from 'lodash';
import * as React from 'react';
import DocumentTitle = require('react-document-title');
import {Link} from 'react-router-dom';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import {colors} from 'material-ui/styles';
import {configs} from 'ts/utils/configs';
import {constants} from 'ts/utils/constants';
import {Styles, ProfileInfo, Partner, WebsitePaths} from 'ts/types';
import {
    Link as ScrollLink,
    Element as ScrollElement,
} from 'react-scroll';
import {utils} from 'ts/utils/utils';
import {Footer} from 'ts/components/footer';
import {TopBar} from 'ts/components/top_bar';
import {NewsletterInput} from 'ts/pages/home/newsletter_input';
import {Statistics} from 'ts/pages/home/statistics';
import {TeamAndAdvisors} from 'ts/pages/home/team_and_advisors';
import {Partnerships} from 'ts/pages/home/partnerships';
import ReactTooltip = require('react-tooltip');

const backersRow1: Partner[] = [
    {
        name: 'Polychain Capital',
        logo: '/images/logos/polychain_capital.png',
        url: 'http://polychain.capital/',
    },
    {
        name: 'Fintech Blockchain Group',
        logo: '/images/logos/FBG.png',
        url: '',
    },
    {
        name: 'Pantera Capital',
        logo: '/images/logos/pantera_capital.png',
        url: 'https://panteracapital.com/',
    },
];

const backersRow2: Partner[] = [
    {
        name: 'Jen Advisors',
        logo: '/images/logos/jen_advisors.png',
        url: 'https://www.jenadvisors.com/',
    },
    {
        name: 'Blockchain Capital',
        logo: '/images/logos/blockchain_capital.png',
        url: 'http://blockchain.capital/',
    },
    undefined,
];

export interface HomeProps {
    location: Location;
}

interface HomeState {}

const styles: Styles = {
    paragraph: {
        lineHeight: 1.4,
        fontSize: 18,
    },
    subheader: {
        textTransform: 'uppercase',
        fontSize: 32,
        margin: 0,
    },
    socalIcon: {
        fontSize: 20,
    },
};

export class Home extends React.Component<HomeProps, HomeState> {
    public render() {
        return (
            <div id="home relative" style={{color: colors.grey800}}>
                <DocumentTitle title="0x Protocol"/>
                <TopBar
                    blockchainIsLoaded={false}
                    location={this.props.location}
                />
                <div
                    className="lg-pb4 md-pb4 sm-pb2 sm-pt0 md-pt4 lg-pt4 mx-auto max-width-4"
                >
                    <div className="lg-pb4 md-pb4 clearfix">
                        <div className="md-col md-col-6 pt4">
                            <div className="pt4 md-pl2 sm-center xs-center sm-hide xs-hide">
                                <div className="pt2">
                                    <img
                                        src="/images/0x_city_square.png"
                                        style={{width: '60%'}}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="md-col md-col-6 sm-col-12 xs-col-12 lg-pt4 md-pt4">
                            <div className="lg-pt4 md-pt4 sm-px4 md-px0 lg-px0">
                                <div className="pt3 sm-hide xs-hide">
                                    <img src="/images/0x_logo_with_text.png" style={{width: 180}} />
                                </div>
                                <div className="pt4 md-hide lg-hide center">
                                    <img src="/images/0x_logo.png" style={{width: 125}} />
                                </div>
                                <div className="pt2 lg-pb2 md-pb2 sm-pb3 sm-h2 sm-center">
                                    <span className="lg-hide md-hide">
                                        <img src="/images/0x_logo_text_only.png" style={{width: 30}} />:
                                    </span>
                                    {' '}The Protocol for Trading Tokens
                                </div>
                                <div className="flex sm-hide xs-hide">
                                    <Link to={`${WebsitePaths.ZeroExJs}`}>
                                        <RaisedButton
                                            label="0x.js"
                                            primary={true}
                                            style={{marginRight: 12}}
                                            buttonStyle={{width: 106}}
                                        />
                                    </Link>
                                    <Link to="/docs/contracts">
                                        <FlatButton
                                            label="Smart Contracts"
                                        />
                                    </Link>
                                    <a
                                        target="_blank"
                                        href={`${WebsitePaths.Whitepaper}`}
                                    >
                                        <FlatButton
                                            label="Whitepaper"
                                        />
                                    </a>
                                    <a
                                        target="_blank"
                                        href={constants.BLOG_URL}
                                    >
                                        <FlatButton
                                            label="Blog"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    style={{backgroundColor: '#272727'}}
                >
                    <div className="clearfix mx-auto max-width-4 pb2" style={{color: 'white'}}>
                        <div className="col lg-col-6 md-col-6 sm-col-12 sm-px2 sm-pb4">
                            <h1
                                className="pt4 sm-center md-pl3 lg-pl0 thin"
                                style={{...styles.subheader}}
                            >
                                Newsletter
                            </h1>
                            <div
                                className="pt2 sm-center sm-px3 md-pl3 lg-pl0 thin"
                                style={{...styles.paragraph}}
                            >
                                Stay up to date with the latest 0x developments
                            </div>
                            <div className="pt1 md-pl3 lg-pl0 sm-center sm-px4">
                                <NewsletterInput />
                            </div>
                        </div>
                        <div className="sm-col sm-col-6 p4 sm-hide xs-hide">
                            <div className="center">
                                <img src="/images/paper_airplane.png" style={{width: 120}} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative" style={{backgroundColor: '#eaeaea'}}>
                    <div className="mx-auto max-width-4 pt2 relative" style={{zIndex: 2}}>
                        <h1
                            className="pt4 lg-h0 xm-center sm-center md-pl3 lg-pl0 thin"
                            style={{textTransform: 'uppercase'}}
                        >
                            The World is Becoming Tokenized
                        </h1>
                        <div
                            className="lg-pb4 md-pb4 sm-pb0 sm-center sm-px3 md-pl3 lg-pl0 thin"
                            style={{maxWidth: 750, ...styles.paragraph}}
                        >
                            <p>
                                The Ethereum blockchain has become host to a{' '}
                                <a href="https://etherscan.io/tokens" target="_blank">
                                    variety of digital assets
                                </a>, with{' '}
                                <a href="https://www.icoalert.com/" target="_blank">
                                    more being created every month
                                </a>. Soon, thousands of assets will be tokenized and moved onto this
                                open financial network.
                            </p>
                            <p>
                                As the token space continues to develop, the need to exchange these{' '}
                                assets will be compounded. 0x protocol will act as a critical piece of{' '}
                                infrastructure for the token economy, allowing Ethereum smart contracts{' '}
                                to programmatically and seamlessly exchange Ethereum-based assets.
                            </p>
                        </div>
                        <div className="lg-py4 md-py4 sm-py2" />
                        <div className="pt4 lg-pb1 md-pb1 sm-pb3 clearfix sm-px3 md-pl3 lg-pl0">
                            <Statistics />
                        </div>
                    </div>
                    <img
                        className="absolute"
                        src="/images/0x_city_globe.png"
                        style={{bottom: 0, right: 0, zIndex: 0, width: 550}}
                    />
                </div>
                <Partnerships />
                <TeamAndAdvisors />
                <div style={{backgroundColor: 'white'}}>
                    <div className="mx-auto max-width-4 pb4">
                        <h1
                            id="backers"
                            className="pt4 sm-center md-pl3 lg-pl0 thin"
                            style={{...styles.subheader}}
                        >
                            Backed by
                        </h1>
                        <div className="pt4 mx-auto md-pl3 lg-pl0">
                            <div className="clearfix center">
                                {this.renderPartners(backersRow1)}
                            </div>
                            <div className="mx-auto">
                                <div className="clearfix pt2 center">
                                    {this.renderPartners(backersRow2)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer location={this.props.location} />
            </div>
        );
    }
    private renderPartners(partners: Partner[]) {
        const colSize = utils.getColSize(partners.length);
        return _.map(partners, (partner: Partner, i: number) => {
            return (
                <div
                    key={!_.isUndefined(partner) ? partner.name : `anonymous-partner-${i}`}
                    className={`sm-col sm-col-${colSize} center sm-pb3`}
                >
                    {_.isUndefined(partner) ?
                        null :
                        <a href={partner.url} target="_blank">
                            <img src={partner.logo} style={{maxWidth: 200, maxHeight: 120}} />
                        </a>
                    }
                </div>
            );
        });
    }
}
