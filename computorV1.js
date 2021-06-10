const S = require('sanctuary')

const transformToAddition = (equation) => {
    const splitted = equation.split(' ')
    for (let i = 0; i < splitted.length; i++) {
        if (splitted[i] === '-') {
            splitted[i] = '+'
            splitted[i + 1] = splitted[i + 1][0] === '-' ? splitted[i + 1].slice(1) : '-' + splitted[i + 1]
        }
    }
    return splitted
}

const transformRightMember = (splitted) => {
    let isRightMember = false
    for (let i = 0; i < splitted.length; i++) {
        if (splitted[i] === '=')
            isRightMember = true
        if (isRightMember && splitted[i] === '*' && splitted[i - 1]) {
            if (splitted[i - 1][0] === '-') {
                splitted[i - 1] = splitted[i - 1].slice(1)
            } else {
                splitted[i - 1] = '-' + splitted[i - 1]
            }
        }
    }
    return splitted
}

const isNormalInteger = str => {
    const n = parseFloat(str)
    return Number.isInteger(n) && n >= 0
}

const getAttributes = splitted => splitted.reduce((a, v, index, arr) => {
    if (v === '*') {
        if (!isNormalInteger(arr[index + 1].split('^')[1]))
            throw new Error('Exposant is not a natural number.')
        a.push({
            coef: parseFloat(arr[index - 1]),
            order: parseInt(arr[index + 1].split('^')[1])
        })
    }
    return a
}, [])

const reduceEquation = equation => equation.reduce((a, v, _i, arr) => {
    if (a.find(el => el.order === v.order) === undefined) {
        const matches = arr.filter(el => el.order === v.order)
        a.push({
            coef: matches.reduce((acc, val) => acc + val.coef, 0),
            order: v.order
        })
    }
    return a
}, [])

const printReduceAndOrder = equation => {
    const reduced = equation.filter(el => el.coef !== 0).map(el => `${el.coef} * X^${el.order}`)
        .join(' + ')
        .split(' ')
    if (reduced[0] === '')
        reduced[0] = '0'
    const order = equation.reduce((a, v) => v.order > a && v.coef !== 0 ? v.order : a, 0)

    for (let i = 0; i < reduced.length; i++) {
        if (reduced[i] === '+' && reduced[i + 1][0] === '-') {
            reduced[i] = '-'
            reduced[i + 1] = reduced[i + 1].slice(1)
        }
    }
    console.log('Reduced form: ', reduced.join(' ').concat(' = 0'))
    console.log('Ploynomial degree: ', order)
    equation.order = order
    return equation
}

const sqrt = x  => {
    const isApprox = guess => {
        const tmp = guess * guess - x
        const abs = tmp < 0 ? -tmp : tmp
        return abs / x < 0.0000001
    }
    
    const improve = guess => {
      return (guess + x / guess) / 2;
    };
    
    const sqrIter = guess => {
      return (isApprox(guess)) ? guess : sqrIter(improve(guess))
    };
    
    return sqrIter(1.0);
  };
  

const solveEquation = equation => {

    const printPrecision = n => n.toPrecision(6)
    const getCoef = order => {
        const data = equation.find(el => el.order === order)
        return data ? data.coef : 0
    }
    if (equation.order > 2)
        throw new Error("The polynomial degree is stricly greater than 2, I can't solve.")
    const a = getCoef(2)
    const b = getCoef(1)
    const c = getCoef(0)
    if (equation.order === 0) {
        if (c === 0)
            console.log("All Real are solution.")
        else
            console.log("There is no solution.")

    }
    else if (equation.order === 1 || (equation.order === 2 && a === 0)) {
        if (b !== 0)
            console.log(`Solution is:\n${-c / b}`)
    }
    else {
        disc = b * b - 4 * (a * c)
        if (disc < 0) {
            const real = -b / (2 * a)
            const complex = sqrt(-disc) / (2 * a)
            console.log(`Discriminant is negative. There is no solution in Real number. Complex solutions are:\n${printPrecision(real)} - ${printPrecision(complex)}i\n${printPrecision(real)} + ${printPrecision(complex)}i`)
        }
        else if (disc === 0) {
            const solution = -b / (2 * a)
            console.log(`Discriminant is equal to 0. There is one double solution:\n${printPrecision(solution)}`)
        } else {
            const solution1 = (-b - sqrt(disc)) / (2 * a)
            const solution2 = (-b + sqrt(disc)) / (2 * a)
            console.log(`Discriminant is strictly positive, the two solutions are:\n${printPrecision(solution1)}\n${printPrecision(solution2)}`)
        }
    }
}

const computerV1 = () => {
    try {
        if (!process.argv[2])
            throw new Error('Usage: node computerV1 "equation"')
        const equation = process.argv[2]
        S.pipe([
            transformToAddition,
            transformRightMember,
            getAttributes,
            reduceEquation,
            printReduceAndOrder,
            solveEquation
        ])(equation)
    } catch (err) {
        console.log(err.message)
    }
}
computerV1()