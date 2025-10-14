;; Mock token contract for testing
;; Implements a simple fungible token for testing the maze contract

(define-fungible-token test-token)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-insufficient-balance (err u102))

;; Mint tokens (only owner can mint)
(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ft-mint? test-token amount recipient)))

;; SIP-010 transfer function
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (try! (ft-transfer? test-token amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)))

;; Get balance
(define-read-only (get-balance (account principal))
  (ok (ft-get-balance test-token account)))

;; Get total supply
(define-read-only (get-total-supply)
  (ok (ft-get-supply test-token)))
