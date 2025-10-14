;; title: maze
;; version: 1.0.0
;; summary: maze game
;; description: maze game

;; traits
;;
(define-trait ft-trait
  (
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))
  )
)

;; token definitions
;; 
(define-data-var xp-token-contract (optional principal) none)

;; constants
;;
(define-data-var contract-owner principal tx-sender)

;; errors
(define-constant err-not-owner u100)
(define-constant err-maze-already-exist u101)
(define-constant err-maze-not-exist u102)
(define-constant err-maze-inactive u103)
(define-constant err-not-registered u104)
(define-constant err-attempt-in-progress u105)
(define-constant err-attempt-not-in-progress u106)
(define-constant err-invalid-proof u107)
(define-constant err-attempt-not-found u108)
(define-constant err-token-not-set u109)
(define-constant err-reward-already-claimed u110)
(define-constant err-reward-record-not-found u111)
(define-constant err-maze-not-completed u112)
(define-constant err-attempt-record-not-found u113)
(define-constant err-ft-transfer-failed u114)
(define-constant err-invalid-path u115)

;; data vars
;;external SIP-010 token integration
(define-data-var token-contract (optional principal) none)

;; private functions
(define-private (is-admin  (caller principal))
    (is-eq caller (var-get contract-owner)))

;; public functions
(define-public (set-token-contract (token principal))
  (begin
    (if (is-admin tx-sender)
      (begin  
       (var-set token-contract (some token))
       (ok true)
      )
      (err err-not-owner)
    )
  )
)


;; MAZE and player state
;; data maps
;;
(define-map mazes {id: uint} {maze-hash: (buff 32), reward: uint, active:bool})
(define-map players {player: principal} {registered: bool, total-score: uint })
(define-map attempts {player: principal, levelId: uint} {startBlock: uint, inProgres: bool, completed: bool, completion-block: (optional uint)})
(define-map rewards-claimed {player: principal, level-id: uint} { claimed: bool})

;; public functions
;;Admins function
 (define-public (transferOwnerhip (new-owner principal))
  (begin
    (if (is-admin tx-sender)
    (begin (var-set contract-owner new-owner)
    (ok true))
    
    (err err-not-owner)
  )))

(define-public (set-xp-token-contract (token-contract principal))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) (err u100)) ;; only owner
    (var-set xp-token-contract (some token-contract))
    (ok true)))


(define-public (create-maze (level-id uint) (maze-hash (buff 32)) (reward uint))
  (begin
    (if (is-admin tx-sender)
      (begin
        (match (map-get? mazes {id: level-id})
          existing-maze (err err-maze-already-exist)
          (begin 
            (map-set mazes {id: level-id} {maze-hash: maze-hash, reward: reward, active: true})
            (ok true))))
      (err err-not-owner))))

        (define-public (set-maze-active (level-id uint) (active bool))
          (begin
             (if (is-admin tx-sender)
                 (match (map-get? mazes {id: level-id}) maze
                   (begin  
                     (map-set mazes {id : level-id} {maze-hash: (get maze-hash maze), reward: (get reward maze), active: active})
                   (ok true))
                 (err err-maze-not-exist))
             (err err-not-owner))))

     ;; PLAYER FLOW
     (define-public (register-player)
      (begin
        (map-set players { player: tx-sender } { registered: true, total-score: u0})
        (ok true)))

        (define-public (start-maze (level-id uint)) 
            (match (map-get? players {player: tx-sender})
                player-data
                (match (map-get? mazes {id: level-id})
                    maze 
                    (if (get active maze)
                        (begin 
                            (map-set attempts {player: tx-sender, levelId: level-id} {startBlock: stacks-block-height, inProgres: true, completed: false, completion-block: none})
                            (ok true))
                        (err err-maze-inactive))
                    (err err-maze-not-exist))
                (err err-not-registered)))

        (define-public (submit-progress (level-id uint) (path-data (buff 128)))
         (match (map-get? attempts { player: tx-sender, levelId: level-id}) attempt
           (if (get inProgres attempt)
             (match (map-get? mazes {id: level-id}) maze
               (let ((expected (get maze-hash maze))
               (computed (sha256 path-data)))
               (if (is-eq expected computed)
                (begin 
                  (map-set attempts { player: tx-sender, levelId: level-id} {
                    startBlock: (get startBlock attempt), inProgres: false, completed: true, completion-block: (some stacks-block-height) })

                    (map-set rewards-claimed {player: tx-sender, level-id: level-id} {claimed: false})

                (ok true))
              (err err-invalid-path)))
              (err err-maze-not-exist))
              (err err-attempt-not-in-progress))
           (err err-attempt-not-found)))

    (define-public (claim-reward (level-id uint) (token <ft-trait>))
       (let 
         (
           (attempt-data (unwrap! (map-get? attempts { player: tx-sender, levelId: level-id}) (err err-attempt-not-found)))
           (maze-data (unwrap! (map-get? mazes { id: level-id}) (err err-maze-not-exist)))
           (reward-amount (get reward maze-data))
           (player tx-sender)
         )
         (asserts! (get completed attempt-data) (err err-maze-not-completed))
         (match (map-get? rewards-claimed {player: tx-sender, level-id: level-id}) 
           rewards-claimed-data
           (asserts! (not (get claimed rewards-claimed-data)) (err err-reward-already-claimed))
           false)
         (try! (as-contract (contract-call? token transfer reward-amount tx-sender player none)))
         (map-set rewards-claimed {player: tx-sender, level-id: level-id} {claimed: true})
         (ok true)))
         
;; read only functions
(define-read-only (get-maze (level-id uint)) (map-get? mazes { id: level-id }))

(define-read-only (player-info (p principal)) (map-get? players { player: p }))


(define-read-only (attempt-info (p principal) (level-id uint)) (map-get? attempts { player: p, levelId: level-id }))

(define-read-only (reward-claimed? (p principal) (level-id uint))
(match (map-get? rewards-claimed { player: p, level-id: level-id }) rewardClaimed (get claimed rewardClaimed) false))


;;

