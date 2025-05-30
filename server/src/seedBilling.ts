import seedBillingData from './utils/seedBillingData';

// Run the seed function
seedBillingData()
  .then(() => {
    console.log('Billing data seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding billing data:', error);
    process.exit(1);
  });
