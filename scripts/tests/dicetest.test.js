
test('testing if dice rolls are random...', () => {
    let total = 0;
    const tries = 50000;
    for(let i=1; i <= tries; i++){
        total += Math.ceil((Math.random() * 6));;
    }
    let average = total/tries;
    console.log("average = " + average);
    expect(average).toBeCloseTo(3.5, 0.1);
});