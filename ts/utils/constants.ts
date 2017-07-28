import {ExchangeContractErrs} from 'ts/types';
import * as BigNumber from 'bignumber.js';

export const constants = {
    BACKEND_BASE_URL: 'https://localhost:3001', // 'https://api.0xproject.com',
    STAGING_DOMAIN: 'staging-0xproject.s3-website-us-east-1.amazonaws.com',
    PRODUCTION_DOMAIN: '0xproject.com',
    BIGNUMBERJS_GITHUB_URL: 'http://mikemcl.github.io/bignumber.js',
    BITLY_ACCESS_TOKEN: 'ffc4c1a31e5143848fb7c523b39f91b9b213d208',
    BITLY_ENDPOINT: 'https://api-ssl.bitly.com',
    CIVIC_APP_ID: 'H1dfQuJEb',
    CUSTOM_BLUE: '#60a4f4',
    DEFAULT_TOKEN_ICON_URL: '/images/token_icons/default.png',
    DEFAULT_DERIVATION_PATH: `44'/60'/0'`,
    ETHER_FAUCET_ENDPOINT: 'https://faucet.0xproject.com/rain',
    FEE_RECIPIENT_ADDRESS: '0x0000000000000000000000000000000000000000',
    FIREFOX_U2F_ADDON: 'https://addons.mozilla.org/en-US/firefox/addon/u2f-support-add-on/',
    HOSTED_TESTNET_URL: 'https://kovan.0xproject.com',
    IP_API_KEY: 'LLx6EVQHoOOfrjl',
    IP_API_ENDPOINT: 'https://pro.ip-api.com/json',
    GITHUB_0X_JS_URL: 'https://github.com/0xProject/0x.js',
    LINKEDIN_0X_URL: 'https://www.linkedin.com/company/0x',
    LEDGER_PROVIDER_NAME: 'Ledger',
    METAMASK_PROVIDER_NAME: 'Metamask',
    PUBLIC_PROVIDER_NAME: '0x Public',
    PARITY_SIGNER_PROVIDER_NAME: 'Parity Signer',
    GENERIC_PROVIDER_NAME: 'Injected Web3',
    MAKER_FEE: new BigNumber(0),
    METAMASK_CHROME_STORE_URL: 'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn',
    PARITY_CHROME_STORE_URL: 'https://chrome.google.com/webstore/detail/parity-signer-ui/\
    fgodinogimdopkigkcoelpfkbnpngalc',
    MIST_DOWNLOAD_URL: 'https://github.com/ethereum/mist/releases',
    NULL_ADDRESS: '0x0000000000000000000000000000000000000000',
    RECAPTCHA_SITE_KEY: '6LcXHicUAAAAAOmRl4ZpDf2MxLEiHolYp1vpdOII',
    ROLLBAR_ACCESS_TOKEN: 'a6619002b51c4464928201e6ea94de65',
    DOCS_SCROLL_DURATION_MS: 0,
    DOCS_CONTAINER_ID: 'documentation',
    HOME_SCROLL_DURATION_MS: 500,
    SUCCESS_STATUS: 200,
    S3_DOCUMENTATION_JSON_ROOT: 'https://s3.amazonaws.com/0xjs-docs-jsons',
    UNAVAILABLE_STATUS: 503,
    TAKER_FEE: new BigNumber(0),
    TESTNET_NAME: 'Kovan',
    TESTNET_NETWORK_ID: 42,
    TESTRPC_NETWORK_ID: 50,
    ETH_DECIMAL_PLACES: 18,
    MINT_AMOUNT: new BigNumber('100000000000000000000'),
    WEB3_DOCS_URL: 'https://github.com/ethereum/wiki/wiki/JavaScript-API',
    WEB3_PROVIDER_DOCS_URL: 'https://github.com/ethereum/wiki/wiki/JavaScript-API#example-7',
    iconUrlBySymbol: {
        REP: '/images/token_icons/augur.png',
        DGD: '/images/token_icons/digixdao.png',
        WETH: '/images/token_icons/ether_erc20.png',
        MLN: '/images/token_icons/melon.png',
        GNT: '/images/token_icons/golem.png',
        MKR: '/images/token_icons/makerdao.png',
        ZRX: '/images/token_icons/zero_ex.png',
    } as {[symbol: string]: string},
    exchangeContractErrToMsg: {
        [ExchangeContractErrs.ERROR_FILL_EXPIRED]: 'The order you attempted to fill is expired',
        [ExchangeContractErrs.ERROR_CANCEL_EXPIRED]: 'The order you attempted to cancel is expired',
        [ExchangeContractErrs.ERROR_FILL_NO_VALUE]: 'This order has already been filled or cancelled',
        [ExchangeContractErrs.ERROR_CANCEL_NO_VALUE]: 'This order has already been filled or cancelled',
        [ExchangeContractErrs.ERROR_FILL_TRUNCATION]: 'The rounding error was too large when filling this order',
        [ExchangeContractErrs.ERROR_FILL_BALANCE_ALLOWANCE]: 'Maker or taker has insufficient balance or allowance',
    },
    networkNameById: {
        1: 'Frontier',
        3: 'Ropsten',
        4: 'Rinkeby',
        42: 'Kovan',
    } as {[symbol: number]: string},
    // Note: This needs to be kept in sync with the types exported in index.ts. Unfortunately there is
    // currently no way to extract the re-exported types from index.ts via TypeDoc :(
    public0xjsTypes: [
        'Order',
        'SignedOrder',
        'ECSignature',
        'ZeroExError',
        'EventCallback',
        'EventCallbackAsync',
        'EventCallbackSync',
        'ExchangeContractErrs',
        'ContractEvent',
        'Token',
        'ExchangeEvents',
        'IndexedFilterValues',
        'SubscriptionOpts',
        'BlockParam',
        'OrderFillOrKillRequest',
        'OrderCancellationRequest',
        'OrderFillRequest',
        'ContractEventEmitter',
        'Web3Provider',
        'ContractEventArgs',
        'LogCancelArgs',
        'LogFillArgs',
        'LogErrorContractEventArgs',
        'TokenEvents',
        'ExchangeContractEventArgs',
        'TransferContractEventArgs',
        'ApprovalContractEventArgs',
        'TokenContractEventArgs',
    ],
    // Crowdsale constants
    TOKEN_SALE_GAS_AMOUNT: 150000,
    TOTAL_ZRX_SUPPLY: 500000000,
};
