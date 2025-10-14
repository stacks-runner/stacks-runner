;; title: MazeXPToken
;; description:MazeXPToken.clar — SIP-010 Compliant Fungible Token
;; Used as in-game XP points for MazeGame

;; traits
;;

;; token definitions
;;


;; constants
;;
(define-constant ERR_UNAUTHORIZED u100)
(define-constant ERR_INSUFFICIENT_BALANCE u101)
(define-constant ERR_INVALID_AMOUNT u102)
(define-constant ERR_ALREADY_INITIALIZED u103)

(define-constant TOKEN_NAME "MazeXP")
(define-constant TOKEN_SYMBOL "XP")
(define-constant TOKEN_DECIMALS u0) ;; integer XP tokens (no fractions)



;; data vars
;;
(define-data-var total-supply uint u0)
(define-data-var owner principal tx-sender)
(define-data-var initialized bool false)

;; data maps
    (define-map balances { user: principal } { balance: uint })

;; public functions
;;
(define-public (transfer (recipient principal) (amount uint))
  (transfer-tokens tx-sender recipient amount))

(define-public (transfer-from (sender principal) (recipient principal) (amount uint))
  ;; Normally SIP-010 supports allowances, but we’ll skip that for simplicity
  (if (is-owner tx-sender)
      (transfer-tokens sender recipient amount)
      (err ERR_UNAUTHORIZED)))


;; SIP-010 expected name
(define-public (ft-transfer? (amount uint) (sender principal) (recipient principal))
  (transfer-tokens sender recipient amount))

  (define-public (initialize (supply uint) (recipient principal))
  (if (var-get initialized)
      (err ERR_ALREADY_INITIALIZED)
      (if (not (is-owner tx-sender))
          (err ERR_UNAUTHORIZED)
          (begin
            (map-set balances { user: recipient } { balance: supply })
            (var-set total-supply supply)
            (var-set initialized true)
            (ok true)))))

(define-public (mint (recipient principal) (amount uint))
  (if (not (is-owner tx-sender))
      (err ERR_UNAUTHORIZED)
      (begin
        (let ((current-supply (var-get total-supply))
              (recipient-bal (default-to u0 (get balance (map-get? balances { user: recipient })))))
          (map-set balances { user: recipient } { balance: (+ recipient-bal amount) })
          (var-set total-supply (+ current-supply amount))
          (ok true)))))


;; read only functions
;;
(define-read-only (get-name) (ok TOKEN_NAME))
(define-read-only (get-symbol) (ok TOKEN_SYMBOL))
(define-read-only (get-decimals) (ok TOKEN_DECIMALS))
(define-read-only (get-total-supply) (ok (var-get total-supply)))

(define-read-only (get-balance (who principal))
  (match (map-get balances { user: who })
    data (ok (get data balance))
    (ok u0)))

;; private functions
;;
(define-private (is-owner (who principal))
  (is-eq who (var-get owner)))

(define-private (transfer-tokens (sender principal) (recipient principal) (amount uint))
  (if (<= amount u0)
      (err ERR_INVALID_AMOUNT)
      (let (
            (sender-bal (default-to u0 (get balance (map-get? balances { user: sender }))))
            (recipient-bal (default-to u0 (get balance (map-get? balances { user: recipient }))))
           )
        (if (< sender-bal amount)
            (err ERR_INSUFFICIENT_BALANCE)
            (begin
              (map-set balances { user: sender } { balance: (- sender-bal amount) })
              (map-set balances { user: recipient } { balance: (+ recipient-bal amount) })
              (ok true))))))
;; Admin function

(define-public (transfer-ownership (new-owner principal))
  (if (is-owner tx-sender)
      (begin (var-set owner new-owner) (ok true))
      (err ERR_UNAUTHORIZED)))
    


