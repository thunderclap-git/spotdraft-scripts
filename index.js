const OPACITY_DROP = 0.5;

const ROI_CALC_FORM_TYPE = 'roi-calc-form';

const ROI_CALC_INPUT = 'roi-calc-input';
const ROI_CALC_INPUT_DEFAULT = 'roi-calc-default';
const ROI_CALC_INPUT_PREVIEW = 'roi-calc-input-preview';

const ROI_CALC_ASSUMPTIONS = 'roi-calc-assumption';
const ROI_CALC_RESULT = 'roi-calc-result';

const ROI_CALC_SELECTION_OPTION = 'roi-calc-option';
const ROI_CALC_FORM_ELEMENT = 'roi-calc-element';

const DEFAULT_VALUES = {
    sales: {
        total_no_of_sales_contract_annually: '500',
        split_of_1pp: '80',
        split_of_3pp: '20',
        hours_spent_on_1pp: '1',
        hours_spent_on_3pp: '5',
        avg_sales_contract_value: '20000',
        avg_time_to_close_sales_contract: '60',
        contract_renewal_rate_every_year: '50',
    },
    vendor: {
        total_no_of_sales_contract_annually: '500',
        split_of_1pp: '80',
        split_of_3pp: '20',
        hours_spent_on_1pp: '1',
        hours_spent_on_3pp: '5',
        avg_sales_contract_value: '20000',
        avg_time_to_close_sales_contract: '60',
        contract_renewal_rate_every_year: '50',
    },
};

let salesCalculator = null;
let vendorCalculator = null;

let currentFormSelection = 'both';
const selectionButtons = document.querySelectorAll(
    `[${ROI_CALC_SELECTION_OPTION}]`
);

const submitButton = document.querySelector(
    `[${ROI_CALC_FORM_ELEMENT}="submit"]`
);

const submitForm = document.querySelector(
    `[${ROI_CALC_FORM_ELEMENT}="submit-form"]`
);

if (submitForm) {
    const form = submitForm.getElementsByTagName('form')[0];

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        generateReport(form);
    });
}

async function generateReport(form) {
    const name = form.getElementsByTagName('input')[0].value;
    const email = form.getElementsByTagName('input')[1].value;

    console.log('submitting form');
    const API_URL =
        'https://nodejs-serverless-function-express-zeta-lyart.vercel.app/api';
    // 'http://www.localhost:3000/api';

    if (currentFormSelection === 'sales') {
        await fetch(`${API_URL}/sales`, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    inputs: salesCalculator.getInputValues(),
                    assumptions: salesCalculator.getAssumptionValues(),
                }),
            })
            .then((res) => {
                console.log(res.json());
            })
            .catch((err) => {
                console.log(err);
            });
    } else if (currentFormSelection === 'vendor') {
        await fetch(`${API_URL}/vendor`, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    inputs: vendorCalculator.getInputValues(),
                    assumptions: vendorCalculator.getAssumptionValues(),
                }),
            })
            .then((res) => {
                console.log(res.json());
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        await fetch(`${API_URL}/sales-and-vendor`, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    sales: {
                        inputs: salesCalculator.getInputValues(),
                        assumptions: salesCalculator.getAssumptionValues(),
                    },
                    vendor: {
                        inputs: vendorCalculator.getInputValues(),
                        assumptions: vendorCalculator.getAssumptionValues(),
                    },
                }),
            })
            .then((res) => {
                console.log(res.json());
            })
            .catch((err) => {
                console.log(err);
            });
    }
}

selectionButtons[0].addEventListener('click', function() {
    handleFormSelectionChange('sales');
});

selectionButtons[1].addEventListener('click', function() {
    handleFormSelectionChange('vendor');
});

selectionButtons[2].addEventListener('click', function() {
    handleFormSelectionChange('both');
});

function handleFormSelectionChange(value) {
    currentFormSelection = value;

    const salesForm = document.querySelector(`[${ROI_CALC_FORM_TYPE}=sales]`);
    const vendorForm = document.querySelector(`[${ROI_CALC_FORM_TYPE}=vendor]`);

    // Determine visibility and opacity based on the selected value
    const isSalesSelected = value === 'sales';
    const isVendorSelected = value === 'vendor';
    const isBothSelected = value === 'both';

    salesForm.style.display =
        isSalesSelected || isBothSelected ? 'block' : 'none';
    vendorForm.style.display =
        isVendorSelected || isBothSelected ? 'block' : 'none';

    // Set opacity for selection buttons
    selectionButtons.forEach((button) => {
        const buttonValue = button.getAttribute(ROI_CALC_SELECTION_OPTION);
        button.style.borderBottom = buttonValue === value ? '1px solid #ab5240' : '0px'
            // button.style.opacity =
            //     buttonValue === value ? '1' : OPACITY_DROP.toString();
    });

    Webflow.destroy();
    Webflow.ready();
    Webflow.require('ix2').init();
}

let sales_assumptions = {
    time_saved_on_1pp_with_clm: 50, // in percentage - 8
    time_saved_on_3pp_with_clm: 75, // in percentage - 9
    sales_contracts_lost_in_missed_renewals: 5, // in percentage - 10
    reduction_in_deal_closure_time: 30, // in percentage - 11
    additional_deals_closed_due_to_time_saved: 10, // in percentage - 12
    avg_salary_of_legal_team_members: 80000, // in dollars - 13
    avg_salary_of_team_members_per_hour: 38, // in dollars - 14
};

let vendor_assumptions = {
    time_saved_on_1pp_with_clm: 50, // in percentage - 8
    time_saved_on_3pp_with_clm: 75, // in percentage - 9
    sales_contracts_lost_in_missed_renewals: 10, // in percentage - 10
    reduction_in_deal_closure_time: 30, // in percentage - 11
    additional_deals_closed_due_to_time_saved: 5, // in percentage - 12
    avg_salary_of_legal_team_members: 80000, // in dollars - 13
    avg_salary_of_team_members_per_hour: 38, // in dollars - 14
};

class Calculator {
    constructor(assumptions, parentElement, calcType) {
        this.assumptions = assumptions;
        this.parentElement = parentElement;
        this.calcType = calcType;

        // input fields
        this.total_no_of_sales_contract_annually = setDefaultValue(
            'total_no_of_sales_contract_annually',
            parentElement,
            calcType
        );
        this.split_of_1pp = setDefaultValue(
            'split_of_1pp',
            parentElement,
            calcType
        );
        this.split_of_3pp = setDefaultValue(
            'split_of_3pp',
            parentElement,
            calcType
        );
        this.hours_spent_on_1pp = setDefaultValue(
            'hours_spent_on_1pp',
            parentElement,
            calcType
        );
        this.hours_spent_on_3pp = setDefaultValue(
            'hours_spent_on_3pp',
            parentElement,
            calcType
        );
        this.avg_sales_contract_value = setDefaultValue(
            'avg_sales_contract_value',
            parentElement,
            calcType
        );
        this.avg_time_to_close_sales_contract = setDefaultValue(
            'avg_time_to_close_sales_contract',
            parentElement,
            calcType
        );
        this.contract_renewal_rate_every_year = setDefaultValue(
            'contract_renewal_rate_every_year',
            parentElement,
            calcType
        );

        // result elements
        this.result_savings_from_time_saved = parentElement.querySelector(
            `[${ROI_CALC_RESULT}="savings_from_time_saved"]`
        );
        this.result_total_revenue_lost = parentElement.querySelector(
            `[${ROI_CALC_RESULT}="total_revenue_lost"]`
        );
        this.result_impact_of_additional_deals = parentElement.querySelector(
            `[${ROI_CALC_RESULT}="impact_of_additional_deals"]`
        );
        this.result_total_impact = parentElement.querySelector(
            `[${ROI_CALC_RESULT}="total_impact"]`
        );
        this.result_roi_of_clm = parentElement.querySelector(
            `[${ROI_CALC_RESULT}="roi_of_clm"]`
        );

        // assumption elements
        this.time_saved_on_1pp_with_clm = setDefaultAssumptionValue(
            'time_saved_on_1pp_with_clm',
            parentElement,
            calcType
        );
        this.time_saved_on_3pp_with_clm = setDefaultAssumptionValue(
            'time_saved_on_3pp_with_clm',
            parentElement,
            calcType
        );
        this.sales_contracts_lost_in_missed_renewals =
            setDefaultAssumptionValue(
                'sales_contracts_lost_in_missed_renewals',
                parentElement,
                calcType
            );
        this.reduction_in_deal_closure_time = setDefaultAssumptionValue(
            'reduction_in_deal_closure_time',
            parentElement,
            calcType
        );
        this.additional_deals_closed_due_to_time_saved =
            setDefaultAssumptionValue(
                'additional_deals_closed_due_to_time_saved',
                parentElement,
                calcType
            );
        this.avg_salary_of_legal_team_members = setDefaultAssumptionValue(
            'avg_salary_of_legal_team_members',
            parentElement,
            calcType
        );
        this.avg_salary_of_team_members_per_hour = setDefaultAssumptionValue(
            'avg_salary_of_team_members_per_hour',
            parentElement,
            calcType
        );
    }

    calculateSavings() {
        this.calculateSalesSavings(this.assumptions);
    }

    getInputValues() {
        return {
            total_no_of_sales_contract_annually: this.total_no_of_sales_contract_annually,
            split_of_1pp: this.split_of_1pp,
            split_of_3pp: this.split_of_3pp,
            hours_spent_on_1pp: this.hours_spent_on_1pp,
            hours_spent_on_3pp: this.hours_spent_on_3pp,
            avg_sales_contract_value: this.avg_sales_contract_value,
            avg_time_to_close_sales_contract: this.avg_time_to_close_sales_contract,
            contract_renewal_rate_every_year: this.contract_renewal_rate_every_year,
        };
    }

    getAssumptionValues() {
        return {
            time_saved_on_1pp_with_clm: this.time_saved_on_1pp_with_clm,
            time_saved_on_3pp_with_clm: this.time_saved_on_3pp_with_clm,
            sales_contracts_lost_in_missed_renewals: this.sales_contracts_lost_in_missed_renewals,
            reduction_in_deal_closure_time: this.reduction_in_deal_closure_time,
            additional_deals_closed_due_to_time_saved: this.additional_deals_closed_due_to_time_saved,
            avg_salary_of_legal_team_members: this.avg_salary_of_legal_team_members,
            avg_salary_of_team_members_per_hour: this.avg_salary_of_team_members_per_hour,
        };
    }

    recalculateSavings(event, form = null) {
        const name = event.target.getAttribute(ROI_CALC_INPUT);
        const value = parseNumber(event.target.value);

        if (name === 'split_of_1pp' || name === 'split_of_3pp') {


            if (name === 'split_of_1pp') {
                const other_pp = form.querySelector(`[${ROI_CALC_INPUT}="split_of_3pp"]`);
                const other_ppValue = parseNumber(form.querySelector(`[${ROI_CALC_INPUT}="split_of_3pp"]`).value);

                if ((other_ppValue + value) > 100) {
                    other_pp.value = 100 - value;
                    updateSliderWidths();
                }

            } else if (name === 'split_of_3pp') {
                const other_pp = form.querySelector(`[${ROI_CALC_INPUT}="split_of_1pp"]`);
                const other_ppValue = parseNumber(form.querySelector(`[${ROI_CALC_INPUT}="split_of_1pp"]`).value);

                if ((other_ppValue + value) > 100) {
                    other_pp.value = 100 - value;
                    updateSliderWidths();
                }
            }

            updateSliderPreview(form);



        } else {
            if (isNaN(value) || !value) this[name] = 0;
            else this[name] = value;
        }
        this.calculateSalesSavings(this.assumptions);
    }

    updateAssumptions(event) {
        const name = event.target.getAttribute(ROI_CALC_ASSUMPTIONS);
        const value = parseNumber(event.target.value);

        if (isNaN(value) || !value) this.assumptions[name] = 0;
        else this.assumptions[name] = value;

        this.calculateSalesSavings(this.assumptions);
    }

    calculateSalesSavings(assumptions) {
        let total_no_of_sales_contract_annually =
            this.total_no_of_sales_contract_annually;
        let split_of_1pp = this.split_of_1pp;
        let split_of_3pp = this.split_of_3pp;
        let hours_spent_on_1pp = this.hours_spent_on_1pp;
        let hours_spent_on_3pp = this.hours_spent_on_3pp;
        let avg_sales_contract_value = this.avg_sales_contract_value;
        let avg_time_to_close_sales_contract =
            this.avg_time_to_close_sales_contract;
        let contract_renewal_rate_every_year =
            this.contract_renewal_rate_every_year;

        // result elements
        let result_savings_from_time_saved =
            this.result_savings_from_time_saved;
        let result_total_revenue_lost = this.result_total_revenue_lost;
        let result_impact_of_additional_deals =
            this.result_impact_of_additional_deals;
        let result_total_impact = this.result_total_impact;
        let result_roi_of_clm = this.result_roi_of_clm;

        calculate();

        function calculate() {
            savings_from_time_saved_in_streamlined_contraction();
            total_revenue_lost_in_missed_renewals_and_risks();
            impact_of_additional_deals_closed_due_to_time_saved();
            total_impact();
        }

        var time_saved_due_to_streamlined_contracting = 0;

        function savings_from_time_saved_in_streamlined_contraction() {
            // step-1
            const number_of_1pp =
                total_no_of_sales_contract_annually * (split_of_1pp / 100);

            // step-2
            const time_saved_for_1_pp_contract =
                hours_spent_on_1pp *
                (1 - assumptions.time_saved_on_1pp_with_clm / 100);

            // step-3
            const number_of_3pp =
                total_no_of_sales_contract_annually * (split_of_3pp / 100);

            // step-4
            const time_saved_for_3_pp_contract =
                hours_spent_on_3pp *
                (assumptions.time_saved_on_3pp_with_clm / 100);

            // step-5
            const total_time_saved_for_1pp =
                number_of_1pp * time_saved_for_1_pp_contract;

            // step-6
            const total_time_saved_for_3pp =
                number_of_3pp * time_saved_for_3_pp_contract;

            // step-7
            const total_time_saved_for_all_contracts =
                total_time_saved_for_1pp + total_time_saved_for_3pp;

            // step-8
            time_saved_due_to_streamlined_contracting =
                total_time_saved_for_all_contracts *
                assumptions.avg_salary_of_team_members_per_hour;

            if (isNaN(time_saved_due_to_streamlined_contracting)) return;

            result_savings_from_time_saved.innerText = `${Math.round(
				time_saved_due_to_streamlined_contracting
			).toLocaleString()}`;
        }

        var total_revenue_saved_due_to_missed_renewals = 0;

        function total_revenue_lost_in_missed_renewals_and_risks() {
            const total_contracts_that_go_into_renewal =
                total_no_of_sales_contract_annually *
                (contract_renewal_rate_every_year / 100);

            const total_missed_renewals =
                total_contracts_that_go_into_renewal *
                (assumptions.sales_contracts_lost_in_missed_renewals / 100);

            total_revenue_saved_due_to_missed_renewals =
                total_missed_renewals * avg_sales_contract_value;

            if (isNaN(total_revenue_saved_due_to_missed_renewals)) return;

            result_total_revenue_lost.innerText = `${Math.round(
				total_revenue_saved_due_to_missed_renewals
			).toLocaleString()}`;
        }

        var total_time_saved_per_deal = 0;

        function impact_of_additional_deals_closed_due_to_time_saved() {
            total_time_saved_per_deal =
                total_no_of_sales_contract_annually *
                (assumptions.additional_deals_closed_due_to_time_saved / 100) *
                avg_sales_contract_value;

            if (isNaN(total_time_saved_per_deal)) return;

            result_impact_of_additional_deals.innerText = `${Math.round(
				total_time_saved_per_deal
			).toLocaleString()}`;
        }

        function total_impact() {
            const total_value_impact =
                time_saved_due_to_streamlined_contracting +
                total_revenue_saved_due_to_missed_renewals +
                total_time_saved_per_deal;

            if (isNaN(total_value_impact)) return;

            result_total_impact.innerText = `${Math.round(
				total_value_impact
			).toLocaleString()}`;
            result_roi_of_clm.innerText = `$ ${Math.round(
				total_value_impact
			).toLocaleString()}`;
        }
    }
}

assignCalculators();

function assignCalculators() {
    handleFormSelectionChange('both');

    // sales
    const salesForm = document.querySelector(`[${ROI_CALC_FORM_TYPE}=sales]`);

    if (salesForm) {
        addAttributesToSliders(salesForm);

        salesCalculator = new Calculator(sales_assumptions, salesForm, 'sales');
        salesCalculator.calculateSavings();

        updateSliderWidths();

        const attachChangeListenerOnForm =
            salesForm.getElementsByTagName('form')[0];
        attachChangeListenerOnForm.addEventListener('change', function(e) {
            updateSliderWidths();
            salesCalculator.recalculateSavings(e, salesForm);
        });

        const assumptionForm = salesForm.querySelectorAll(
            '[roi-calc-element="assumptions"]'
        )[0];
        if (assumptionForm) {
            assumptionForm.addEventListener('change', function(e) {
                salesCalculator.updateAssumptions(e);
            });
        }
    }

    const vendorForm = document.querySelector(`[${ROI_CALC_FORM_TYPE}=vendor]`);
    if (vendorForm) {
        addAttributesToSliders(vendorForm);

        vendorCalculator = new Calculator(
            vendor_assumptions,
            vendorForm,
            'vendor'
        );
        vendorCalculator.calculateSavings();

        updateSliderWidths();

        const attachChangeListenerOnForm =
            vendorForm.getElementsByTagName('form')[0];
        attachChangeListenerOnForm.addEventListener('change', function(e) {
            updateSliderWidths();
            vendorCalculator.recalculateSavings(e, vendorForm);
        });

        const assumptionForm = vendorForm.querySelectorAll(
            '[roi-calc-element="assumptions"]'
        )[0];
        if (assumptionForm) {
            assumptionForm.addEventListener('change', function(e) {
                vendorCalculator.updateAssumptions(e);
            });
        }
    }
}

function updateSliderPreview(form) {
    const one_pp_slider = form.querySelector(`[${ROI_CALC_INPUT}="split_of_1pp"]`);
    const one_pp_slider_value_preview = form.querySelector(`[${ROI_CALC_INPUT_PREVIEW}="split_of_1pp"]`);
    one_pp_slider_value_preview.innerText = one_pp_slider.value;

    const three_pp_slider = form.querySelector(`[${ROI_CALC_INPUT}="split_of_3pp"]`);
    const three_pp_slider_value_preview = form.querySelector(`[${ROI_CALC_INPUT_PREVIEW}="split_of_3pp"]`);
    three_pp_slider_value_preview.innerText = three_pp_slider.value;
}

function addSliderListners() {
    const salesForm = document.getElementsByTagName('form')[0];
    const vendorForm = document.getElementsByTagName('form')[1];

    salesForm.addEventListener('input', function() {
        updateSliderWidths();
    })

    vendorForm.addEventListener('input', function() {
        updateSliderWidths();
    })
}

function updateSliderWidths() {
    const one_pp_sliders = document.querySelectorAll(
        '[roi-calc-input="split_of_1pp"]'
    );

    const three_pp_sliders = document.querySelectorAll(
        '[roi-calc-input="split_of_3pp"]'
    );

    one_pp_sliders.forEach((slider) => {
        const parentElement = slider.parentElement;
        const fill = parentElement.querySelector('[tc-range-elm="fill"]');
        fill.style.width = `${slider.value}%`;
    });

    three_pp_sliders.forEach((slider) => {
        const parentElement = slider.parentElement;
        const fill = parentElement.querySelector('[tc-range-elm="fill"]');
        fill.style.width = `${slider.value}%`;
    });
}

function createSliders(formElement) {
    // for 1 pp
    const rangeInputContainer = formElement.querySelector(
        '[roi-calc-element="split_of_1pp"]'
    );

    // insert just above range input container
    rangeInputContainer.insertAdjacentHTML(
        (position = 'beforebegin'),
        `
        <div style="font-size:14px; color:gray; display: flex; width: 100%; margin: 0px 0px; justify-content: space-between;
        ">
            <p style="width: 18px; text-align: center;">0</p>
            <p style="width: 18px; text-align: center;">10</p>
            <p style="width: 18px; text-align: center;">20</p>
            <p style="width: 18px; text-align: center;">30</p>
            <p style="width: 18px; text-align: center;">40</p>
            <p style="width: 18px; text-align: center;">50</p>
            <p style="width: 18px; text-align: center;">60</p>
            <p style="width: 18px; text-align: center;">70</p>
            <p style="width: 18px; text-align: center;">80</p>
            <p style="width: 18px; text-align: center;">90</p>
            <p style="width: 18px; text-align: center;">100</p>    
        </div>
    `
    );

    const childrenElements = `
            <input
                roi-calc-input="split_of_1pp"
				type="range"
				value="80"
				min="0"
				max="100"
				step="10"
                tc-range-elm="input"
                >

			<div tc-range-elm="track" />
			<div tc-range-elm="fill" />
            `;

    rangeInputContainer.innerHTML = childrenElements;

    // for 3 pp
    const rangeInputContainer2 = formElement.querySelector(
        '[roi-calc-element="split_of_3pp"]'
    );
    rangeInputContainer2.insertAdjacentHTML(
        (position = 'beforebegin'),
        `
        <div style="font-size:14px; color:gray; display: flex; width: 100%; margin: 0px 0px; justify-content: space-between;
        ">
            <p style="width: 18px; text-align: center;">0</p>
            <p style="width: 18px; text-align: center;">10</p>
            <p style="width: 18px; text-align: center;">20</p>
            <p style="width: 18px; text-align: center;">30</p>
            <p style="width: 18px; text-align: center;">40</p>
            <p style="width: 18px; text-align: center;">50</p>
            <p style="width: 18px; text-align: center;">60</p>
            <p style="width: 18px; text-align: center;">70</p>
            <p style="width: 18px; text-align: center;">80</p>
            <p style="width: 18px; text-align: center;">90</p>
            <p style="width: 18px; text-align: center;">100</p>    
        </div>
    `
    );
    const childrenElements2 = `
            <input
                roi-calc-input="split_of_3pp"
                type="range"
                value="20"
                min="0"
                max="100"
                step="10"
                tc-range-elm="input"/>


            <div tc-range-elm="track" />
            <div tc-range-elm="fill" />
            `;
    rangeInputContainer2.innerHTML = childrenElements2;
}

function injectSliderCSS() {
    const head = document.head;
    const styles = `
        [tc-range-input] {
            position: relative;
            width: 100%;
            height: 32px;
            border-radius: 4px;
        }

        [tc-range-elm="track"] {
            position: absolute;
            display: flex;
            top: 0;
            left: 0;
            border-radius: 20px;
            z-index: 10;
            width: 100%;
            height: .375rem;
            background-color: #e2e2e2;
        }

        [tc-range-elm="fill"] {
            background-color: #7186d3;
            position: absolute;
            height: 100%;
            border-radius: 20px;
            z-index: 20;
            width: 100%;
            top: 0;
            left: 0;
        }

        [tc-range-elm="input"] {
            -webkit-appearance: none;
            background-color: transparent;
            width: 100%;
            height: 100%;
        }

        [tc-range-elm="input"]::-webkit-slider-thumb {
            position: relative;
            -webkit-appearance: none;
            background-color: #7186d3;
            z-index: 50;
            border-radius: 4px;
            width: 1.75rem;
            cursor: pointer;
            height: 1.25rem;
            transform: translateY(-75%);
            margin-top: 2px;
        }
        [tc-range-elm="input"]::-webkit-slider-thumb:active {
            background-color: #5c2aff;
        }
    `;

    head.insertAdjacentHTML('beforeend', `<style>${styles}</style>`);
}

function addAttributesToSliders(formElement) {
    injectSliderCSS();
    createSliders(formElement);
    addSliderListners();

    // add attributes to input fields
    const split_1pp_parent = formElement.querySelector(
        `[roi-calc-fc-element="split_of_1pp"]`
    );

    const split_1pp_input = split_1pp_parent.getElementsByTagName('input')[0];
    split_1pp_input.setAttribute(ROI_CALC_INPUT, 'split_of_1pp');

    const split_3pp_parent = formElement.querySelector(
        `[roi-calc-fc-element="split_of_3pp"]`
    );
    const split_3pp_input = split_3pp_parent.getElementsByTagName('input')[0];
    split_3pp_input.setAttribute(ROI_CALC_INPUT, 'split_of_3pp');
}

function parseNumber(value) {
    return parseFloat(value);
}

function setDefaultValue(name, parentElement, calcType) {
    const element = parentElement.querySelector(`[${ROI_CALC_INPUT}=${name}]`);
    let value = parseInt(element.getAttribute(ROI_CALC_INPUT_DEFAULT));
    if (isNaN(value) || !value) {
        if (calcType === 'sales') {
            value = parseNumber(DEFAULT_VALUES.sales[name]);
        } else {
            value = parseNumber(DEFAULT_VALUES.vendor[name]);
        }
    }

    element.value = value;

    return value;
}

function setDefaultAssumptionValue(name, parentElement, calcType) {
    const element = parentElement.querySelector(
        `[${ROI_CALC_ASSUMPTIONS}=${name}]`
    );
    element.type = 'number';
    if (!element) return 0;
    let value = parseInt(element.getAttribute(ROI_CALC_INPUT_DEFAULT));

    if (isNaN(value) || !value) {
        if (calcType === 'sales') {
            value = sales_assumptions[name];
        } else {
            value = vendor_assumptions[name];
        }
    }

    element.setAttribute('value', value);

    return value;
}