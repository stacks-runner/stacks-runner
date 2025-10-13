// Stacks API integration
class StacksAPI {
    constructor() {
        this.isWalletConnected = false;
        this.userAddress = null;
        this.network = CONFIG.NETWORK === 'mainnet' ? 
            new StacksNetwork.StacksMainnet() : 
            new StacksNetwork.StacksTestnet();
    }

    async connectWallet() {
        try {
            const authResponse = await StacksConnect.showConnect({
                appDetails: {
                    name: "StackRunner",
                    icon: window.location.origin + "/assets/icon.png"
                },
                redirectTo: window.location.origin,
                onFinish: (data) => {
                    this.isWalletConnected = true;
                    this.userAddress = data.userSession.loadUserData().profile.stxAddress[CONFIG.NETWORK];
                    this.updateWalletUI();
                },
                userSession: new StacksConnect.UserSession()
            });
            
            return authResponse;
        } catch (error) {
            console.error('Error connecting wallet:', error);
            throw error;
        }
    }

    async disconnectWallet() {
        try {
            const userSession = new StacksConnect.UserSession();
            await userSession.signUserOut();
            this.isWalletConnected = false;
            this.userAddress = null;
            this.updateWalletUI();
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
        }
    }

    updateWalletUI() {
        const walletButton = document.getElementById('wallet-button');
        const walletAddress = document.getElementById('wallet-address');

        if (this.isWalletConnected && this.userAddress) {
            walletButton.textContent = 'Disconnect';
            walletButton.onclick = () => this.disconnectWallet();
            
            walletAddress.textContent = `${this.userAddress.slice(0, 8)}...${this.userAddress.slice(-4)}`;
            walletAddress.style.display = 'block';
        } else {
            walletButton.textContent = 'Connect Wallet';
            walletButton.onclick = () => this.connectWallet();
            walletAddress.style.display = 'none';
        }
    }

    async getAccountBalance() {
        if (!this.userAddress) {
            throw new Error('Wallet not connected');
        }

        try {
            const response = await fetch(
                `${this.network.coreApiUrl}/extended/v1/address/${this.userAddress}/balances`
            );
            const data = await response.json();
            return data.stx.balance;
        } catch (error) {
            console.error('Error fetching balance:', error);
            throw error;
        }
    }

    async getTransactionStatus(txId) {
        try {
            const response = await fetch(
                `${this.network.coreApiUrl}/extended/v1/tx/${txId}`
            );
            const data = await response.json();
            return data.tx_status;
        } catch (error) {
            console.error('Error fetching transaction status:', error);
            throw error;
        }
    }

    async waitForTransaction(txId, maxWaitTime = 60000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWaitTime) {
            try {
                const status = await this.getTransactionStatus(txId);
                
                if (status === 'success') {
                    return { success: true, status };
                } else if (status === 'abort_by_response' || status === 'abort_by_post_condition') {
                    return { success: false, status };
                }
                
                // Wait 2 seconds before checking again
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.warn('Error checking transaction status:', error);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        return { success: false, status: 'timeout' };
    }

    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 8)}...${address.slice(-4)}`;
    }

    formatSTXAmount(microSTX) {
        return (parseInt(microSTX) / 1000000).toFixed(6);
    }

    // Initialize wallet connection on page load
    async initialize() {
        try {
            const userSession = new StacksConnect.UserSession();
            
            if (userSession.isUserSignedIn()) {
                const userData = userSession.loadUserData();
                this.isWalletConnected = true;
                this.userAddress = userData.profile.stxAddress[CONFIG.NETWORK];
                this.updateWalletUI();
            }
        } catch (error) {
            console.warn('Error initializing wallet connection:', error);
        }
    }
}

// Create global instance
window.stacksAPI = new StacksAPI();
