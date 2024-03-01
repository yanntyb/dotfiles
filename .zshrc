# Enable Powerlevel10k instant prompt.
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="powerlevel10k/powerlevel10k"

export HIST_STAMPS="dd/mm/yyyy"

plugins=(git)

source $ZSH/oh-my-zsh.sh

# To customize prompt, run `p10k configure` or edit ~/.p10k.zsh.
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
export PATH=/opt/homebrew/bin:/Users/yann/.nvm/versions/node/v20.11.1/bin:/Applications/MAMP/bin/php/php8.2.4/bin:/usr/local/bin:/System/Cryptexes/App/usr/bin:/usr/bin:/bin:/usr/sbin:/sbins

[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh

#path
export PATH="$PATH:/Applications/PhpStorm.app/Contents/MacOS"

#zoxide

export _ZO_ECHO="1"
eval "$(zoxide init zsh --cmd cd)"

#alias
source ~/.aliases
