

function Synth(){
    this.audio = new (window.AudioContext || window.webkitAudioContext)();
    var audio = this.audio;
    this.osc_type = "sine";

    this.playOscillation = function(freq, attack, decay) {
        if (!attack) attack = 10;
        if (!decay) decay = 250;
        var gain = audio.createGain();
        var osc = audio.createOscillator();

        gain.connect(audio.destination);
        gain.gain.setValueAtTime(0, audio.currentTime);
        gain.gain.linearRampToValueAtTime(1, audio.currentTime + attack / 1000);
        gain.gain.linearRampToValueAtTime(0, audio.currentTime + decay / 1000);

        osc.frequency.value = freq;
        osc.type = this.osc_type;
        osc.connect(gain);
        osc.start(0);

        setTimeout(function() {
            osc.stop(0);
            osc.disconnect(gain);
            gain.disconnect(audio.destination);
        }, decay)
    }
}