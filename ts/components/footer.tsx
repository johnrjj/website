import * as _ from 'lodash';
import * as React from 'react';
import {HashLink} from 'react-router-hash-link';
import {Styles, WebsitePaths} from 'ts/types';
import {
  Link,
} from 'react-router-dom';
import {
    Link as ScrollLink,
} from 'react-scroll';
import {constants} from 'ts/utils/constants';

interface MenuItemsBySection {
    [sectionName: string]: FooterMenuItem[];
}

interface FooterMenuItem {
    title: string;
    path?: string;
    isExternal?: boolean;
    fileName?: string;
    isHomepage?: boolean;
}

enum Sections {
    Documentation = 'Documentation',
    Community = 'Community',
    Organization = 'Organization',
}

const ICON_DIMENSION = 16;
const menuItemsBySection: MenuItemsBySection = {
    Documentation: [
        {
            title: '0x.js',
            path: WebsitePaths.ZeroExJs,
        },
        {
            title: '0x Smart Contracts',
            path: WebsitePaths.SmartContracts,
        },
        {
            title: 'Whitepaper',
            path: WebsitePaths.Whitepaper,
            isExternal: true,
        },
        {
            title: 'Wiki',
            path: WebsitePaths.Wiki,
        },
        {
            title: 'FAQ',
            path: WebsitePaths.FAQ,
        },
    ],
    Community: [
        {
            title: 'Slack',
            isExternal: true,
            path: constants.SLACK_URL,
            fileName: 'slack.png',
        },
        {
            title: 'Blog',
            isExternal: true,
            path: constants.BLOG_URL,
            fileName: 'medium.png',
        },
        {
            title: 'Twitter',
            isExternal: true,
            path: constants.TWITTER_URL,
            fileName: 'twitter.png',
        },
        {
            title: 'Reddit',
            isExternal: true,
            path: constants.REDDIT_URL,
            fileName: 'reddit.png',
        },
    ],
    Organization: [
        {
            title: 'Team',
            isExternal: false,
            isHomepage: true,
        },
        {
            title: 'Advisors',
            isExternal: false,
            isHomepage: true,
        },
        {
            title: 'Contact',
            isExternal: true,
            path: 'mailto:team@0xproject.com',
        },
    ],
};
const linkStyle = {
    color: 'white',
    cursor: 'pointer',
};

const titleToIcon: {[title: string]: string} = {
    Slack: 'slack.png',
    Blog: 'medium.png',
    Twitter: 'twitter.png',
    Reddit: 'reddit.png',
};

export interface FooterProps {
    location: Location;
}

interface FooterState {}

export class Footer extends React.Component<FooterProps, FooterState> {
    public render() {
        return (
            <div className="relative pb4 pt2" style={{backgroundColor: '#393939'}}>
                <div className="mx-auto max-width-4 py4 clearfix" style={{color: 'white'}}>
                    <div className="col col-4 left">
                        <div className="center" style={{width: 148}}>
                            <div>
                                <img src="/images/protocol_logo_white.png" height="30" />
                            </div>
                            <div className="pt2" style={{fontSize: 11, color: '#CACACA'}}>
                                Copyright © ZeroEx, Intl.
                            </div>
                        </div>
                    </div>
                    <div className="col col-8 pl4">
                        <div className="col col-4">
                            <div className="right">
                                {this.renderHeader(Sections.Documentation)}
                                {_.map(menuItemsBySection[Sections.Documentation], this.renderMenuItem.bind(this))}
                            </div>
                        </div>
                        <div className="col col-4">
                            <div className="right">
                                {this.renderHeader(Sections.Community)}
                                {_.map(menuItemsBySection[Sections.Community], this.renderMenuItem.bind(this))}
                            </div>
                        </div>
                        <div className="col col-4">
                            <div className="right">
                                {this.renderHeader(Sections.Organization)}
                                {_.map(menuItemsBySection[Sections.Organization], this.renderMenuItem.bind(this))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    private renderIcon(fileName: string) {
        return (
            <div style={{height: ICON_DIMENSION, width: ICON_DIMENSION}}>
                <img src={`/images/social/${fileName}`} style={{width: ICON_DIMENSION}} />
            </div>
        );
    }
    private renderMenuItem(item: FooterMenuItem) {
        const iconIfExists = titleToIcon[item.title];
        return (
            <div
                key={item.title}
                style={{fontSize: 13, paddingTop: 25}}
            >
                {item.isExternal ?
                    <a
                        className="text-decoration-none"
                        style={linkStyle}
                        target="_blank"
                        href={item.path}
                    >
                        <div className="flex">
                            {!_.isUndefined(iconIfExists) &&
                                <div className="pr1">
                                    {this.renderIcon(iconIfExists)}
                                </div>
                            }
                            {item.title}
                        </div>
                    </a> :
                    item.isHomepage ?
                        this.renderHomepageLink(item.title) :
                        <Link
                            to={item.path}
                            style={linkStyle}
                            className="text-decoration-none"
                        >
                            <div className="flex">
                                {!_.isUndefined(iconIfExists) &&
                                    <div className="pr1">
                                        {this.renderIcon(iconIfExists)}
                                    </div>
                                }
                                {item.title}
                            </div>
                        </Link>
                }
            </div>
        );
    }
    private renderHeader(title: string) {
        const headerStyle = {
            textTransform: 'uppercase',
            color: '#9E9E9E',
            letterSpacing: 2,
            fontFamily: 'Roboto Mono',
            fontSize: 13,
        };
        return (
            <div
                className="pb2"
                style={headerStyle}
            >
                {title}
            </div>
        );
    }
    private renderHomepageLink(title: string) {
        const hash = title.toLowerCase();
        if (this.props.location.pathname === WebsitePaths.Home) {
            return (
                <ScrollLink
                    style={linkStyle}
                    to={hash}
                    smooth={true}
                    offset={0}
                    duration={constants.HOME_SCROLL_DURATION_MS}
                    containerId="home"
                >
                    {title}
                </ScrollLink>
            );
        } else {
            return (
                <HashLink
                    to={`/#${hash}`}
                    className="text-decoration-none"
                    style={linkStyle}
                >
                    {title}
                </HashLink>
            );
        }
    }
}
