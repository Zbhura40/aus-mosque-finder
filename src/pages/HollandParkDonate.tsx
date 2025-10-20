import React, { useState } from "react";
import { Heart, Users, BookOpen, Home as HomeIcon, Calendar, DollarSign, CreditCard, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HollandParkDonate = () => {
  const navigate = useNavigate();
  const [donationType, setDonationType] = useState<'once' | 'monthly'>('once');
  const [donationAmount, setDonationAmount] = useState<number | ''>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const suggestedAmounts = [50, 100, 250, 500, 1000];

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setDonationAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setDonationAmount(numValue);
    } else {
      setDonationAmount('');
    }
  };

  return (
    <div className="min-h-screen bg-warm-ivory">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-islamic-green to-islamic-green/80 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Support Holland Park Mosque
          </h1>
          <p className="text-xl md:text-2xl text-warm-ivory/90 mb-4">
            Your donations help us serve the growing needs of the Muslim community
          </p>
          <p className="text-lg text-warm-ivory/80">
            Established in 1908, we continue to provide a spiritual home for over 500 weekly attendees from 45+ nationalities
          </p>
        </div>
      </div>

      {/* Impact Story Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="font-display text-3xl font-bold text-architectural-shadow mb-6">
              Every Contribution Makes a Difference
            </h2>
            <p className="text-architectural-shadow/80 text-lg mb-4 leading-relaxed">
              As Australia's oldest continuously operating mosque on the East Coast, Holland Park Mosque has been serving the Muslim community for over 114 years.
            </p>
            <p className="text-architectural-shadow/80 text-lg leading-relaxed">
              Your generous donations help us maintain this historic site, provide quality Islamic education through our Madressa programs, support community services, and ensure that future generations have a place to worship, learn, and grow together.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&h=600&fit=crop"
              alt="Community gathering at mosque"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* How We Help Section */}
        <section className="mb-20">
          <h2 className="font-display text-3xl font-bold text-architectural-shadow mb-4 text-center">
            How Your Donation Helps
          </h2>
          <p className="text-center text-architectural-shadow/70 mb-12 max-w-3xl mx-auto text-lg">
            Your support enables us to provide essential services to our diverse community and maintain our historic mosque for future generations.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="w-20 h-20 bg-islamic-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-islamic-green" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Islamic Education</h3>
              <p className="text-architectural-shadow/70">
                Support our Madressa programs providing quality Quranic education to children from Monday to Saturday, including specialized Hifz classes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="w-20 h-20 bg-islamic-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <HomeIcon className="w-10 h-10 text-islamic-green" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Mosque Maintenance</h3>
              <p className="text-architectural-shadow/70">
                Help preserve this 114-year-old historic site, ensuring it remains a safe and welcoming space for worship and community gatherings.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="w-20 h-20 bg-islamic-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-islamic-green" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Community Services</h3>
              <p className="text-architectural-shadow/70">
                Enable marriage services, counseling, funeral support, and various community programs that serve over 500 families weekly.
              </p>
            </div>
          </div>
        </section>

        {/* Impact Statistics */}
        <section className="mb-20 bg-white rounded-xl shadow-lg p-12">
          <h2 className="font-display text-3xl font-bold text-architectural-shadow mb-10 text-center">
            Our Impact
          </h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-islamic-green mb-2">500+</div>
              <div className="text-architectural-shadow/70">Weekly Attendees</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-islamic-green mb-2">45+</div>
              <div className="text-architectural-shadow/70">Nationalities</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-islamic-green mb-2">114</div>
              <div className="text-architectural-shadow/70">Years of Service</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-islamic-green mb-2">6</div>
              <div className="text-architectural-shadow/70">Days of Madressa</div>
            </div>
          </div>
        </section>

        {/* Donation Form */}
        <section className="mb-20">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-islamic-green to-islamic-green/80 text-white p-8 text-center">
                <h2 className="font-display text-3xl font-bold mb-2">Make a Donation</h2>
                <p className="text-warm-ivory/90">Every contribution helps strengthen our community</p>
              </div>

              <div className="p-8">
                {/* Donation Type Selection */}
                <div className="mb-8">
                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={() => setDonationType('once')}
                      className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all ${
                        donationType === 'once'
                          ? 'bg-islamic-green text-white shadow-lg'
                          : 'bg-gray-100 text-architectural-shadow hover:bg-gray-200'
                      }`}
                    >
                      One-Time Donation
                    </button>
                    <button
                      onClick={() => setDonationType('monthly')}
                      className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all ${
                        donationType === 'monthly'
                          ? 'bg-islamic-green text-white shadow-lg'
                          : 'bg-gray-100 text-architectural-shadow hover:bg-gray-200'
                      }`}
                    >
                      Monthly Donation
                    </button>
                  </div>

                  {donationType === 'monthly' && (
                    <div className="bg-golden-amber/10 border border-golden-amber/30 rounded-lg p-4 mb-6">
                      <p className="text-architectural-shadow/80 text-sm">
                        <strong>Monthly giving</strong> helps us plan ahead and maintain consistent support for our programs and services throughout the year.
                      </p>
                    </div>
                  )}
                </div>

                {/* Amount Selection */}
                <div className="mb-8">
                  <label className="block text-lg font-semibold text-architectural-shadow mb-4">
                    Select Amount
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                    {suggestedAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleAmountSelect(amount)}
                        className={`py-4 px-4 rounded-lg font-semibold transition-all ${
                          selectedAmount === amount
                            ? 'bg-islamic-green text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-architectural-shadow hover:bg-gray-200 hover:scale-105'
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-architectural-shadow/50">
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="Enter custom amount"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-lg focus:border-islamic-green focus:outline-none text-lg"
                      min="1"
                    />
                  </div>
                </div>

                {/* Tax Deductible Notice */}
                <div className="bg-islamic-green/5 border border-islamic-green/20 rounded-lg p-4 mb-8">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-islamic-green flex-shrink-0 mt-0.5" />
                    <p className="text-architectural-shadow/80 text-sm">
                      All donations to Holland Park Mosque support our charitable activities and community programs. Please consult your tax advisor regarding tax deductibility.
                    </p>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4">
                  <button
                    disabled={!donationAmount}
                    className={`w-full py-5 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                      donationAmount
                        ? 'bg-islamic-green text-white hover:bg-islamic-green/90 shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <CreditCard className="w-6 h-6" />
                    Donate {donationAmount ? `$${donationAmount}` : ''} with Credit Card
                  </button>

                  <button
                    disabled={!donationAmount}
                    className={`w-full py-5 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                      donationAmount
                        ? 'bg-golden-amber text-architectural-shadow hover:bg-golden-amber/90 shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.76-4.852a.932.932 0 0 1 .924-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.757-4.471z"/>
                    </svg>
                    Donate {donationAmount ? `$${donationAmount}` : ''} with PayPal
                  </button>
                </div>

                <p className="text-center text-sm text-architectural-shadow/60 mt-6">
                  You will be securely redirected to complete your payment
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Other Ways to Give */}
        <section className="mb-16">
          <h2 className="font-display text-3xl font-bold text-architectural-shadow mb-8 text-center">
            Other Ways to Support
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Calendar className="w-12 h-12 text-islamic-green mb-4" />
              <h3 className="font-semibold text-xl mb-3">Volunteer</h3>
              <p className="text-architectural-shadow/70 mb-4">
                Join our community of volunteers helping with various mosque activities and programs.
              </p>
              <a
                href="https://www.hollandparkmosque.org.au/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-islamic-green hover:text-islamic-green/80 font-semibold text-sm"
              >
                Learn More →
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <Heart className="w-12 h-12 text-islamic-green mb-4" />
              <h3 className="font-semibold text-xl mb-3">Zakat & Sadaqah</h3>
              <p className="text-architectural-shadow/70 mb-4">
                Fulfill your religious obligations by donating your Zakat and Sadaqah to support community programs.
              </p>
              <button className="text-islamic-green hover:text-islamic-green/80 font-semibold text-sm">
                Contact Us →
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <DollarSign className="w-12 h-12 text-islamic-green mb-4" />
              <h3 className="font-semibold text-xl mb-3">Bequest</h3>
              <p className="text-architectural-shadow/70 mb-4">
                Leave a lasting legacy by including Holland Park Mosque in your will.
              </p>
              <button className="text-islamic-green hover:text-islamic-green/80 font-semibold text-sm">
                Learn More →
              </button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="font-display text-3xl font-bold text-architectural-shadow mb-8 text-center">
            Questions About Donating
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2">Is my donation tax deductible?</h3>
              <p className="text-architectural-shadow/70">
                Donations to Holland Park Mosque support our charitable and community activities. Please consult with your tax advisor to determine if your donation is tax deductible based on your individual circumstances.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2">How will my donation be used?</h3>
              <p className="text-architectural-shadow/70">
                Your donations support mosque operations, maintenance, Madressa programs, community services, and various charitable activities that benefit the Muslim community and broader society.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2">Can I cancel my monthly donation?</h3>
              <p className="text-architectural-shadow/70">
                Yes, you can cancel or modify your monthly donation at any time by contacting us. We appreciate any support you can provide, for any duration.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2">Will I receive a receipt?</h3>
              <p className="text-architectural-shadow/70">
                Yes, all donors receive a receipt via email confirming their donation. For tax purposes, please keep this receipt for your records.
              </p>
            </div>
          </div>
        </section>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => navigate("/featured/holland-park-mosque")}
            className="px-8 py-3 bg-architectural-shadow text-white rounded-lg hover:bg-architectural-shadow/90 transition-colors font-semibold"
          >
            ← Back to Holland Park Mosque
          </button>
        </div>
      </div>
    </div>
  );
};

export default HollandParkDonate;
